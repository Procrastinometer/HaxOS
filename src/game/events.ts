import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { getGameState, setGameMode, setMatchActive, resetCaptainsState, updateCaptainsState } from './state';
import { GameMode } from './types';
import { mainQueue } from './queue';
import { GameManager } from './manager';
import { startCaptainsDraft, updateAvatarsForDraft, promptNextPick } from './captains';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { GAME_CONFIG } from './constants';
import { resetAFKTimer } from '../afk/state';

export const handleBigMatchLeaver = (room: RoomObject, leaver: PlayerObject) => {
    const state = getGameState();
    if (state.mode !== GameMode.BIG_MATCH) return;

    const leaverTeam = leaver.team;
    if (leaverTeam === 0) return;

    const activeSpecs = mainQueue.getActivePlayers(room.getPlayerList()).filter(p => p.team === 0);

    if (activeSpecs.length > 0) {
        if (activeSpecs.length === 1) {
            const sub = activeSpecs[0];
            room.setPlayerTeam(sub.id, leaverTeam);
            resetAFKTimer(sub.id);
        } else {
            room.pauseGame(true);
            sendMessage(room, `Стоп гра! Хтось вийшов.`, null, COLORS.ERROR);
            sendMessage(room, `Captain, type !pick <number> to sub a player from specs!`, null, COLORS.INFO);
            const sub = activeSpecs[0];
            setTimeout(() => {
                room.setPlayerTeam(sub.id, leaverTeam);
                resetAFKTimer(sub.id);
                sendMessage(room, `${sub.name} обрано з черги.`, null, COLORS.SUCCESS);
                room.pauseGame(false);
            }, 3000);
        }
    }
    else {
        const enemyTeamId = leaverTeam === 1 ? 2 : 1;
        const enemyPlayers = room.getPlayerList().filter(p => p.team === enemyTeamId);

        if (enemyPlayers.length > 0) {
            const victim = enemyPlayers[enemyPlayers.length - 1];
            room.setPlayerTeam(victim.id, 0);
            sendMessage(room, `Балансуємо команди... ${victim.name} відпочинь трошки`, null, COLORS.INFO);
        }
    }
};

export const handleGameEnd = (room: RoomObject, winningTeamId: number) => {
    const state = getGameState();
    if (state.mode === GameMode.SMALL_MATCH) {
        setMatchActive(false);
        GameManager.checkAutoBalance(room);
        return;
    }

    if (state.mode === GameMode.BIG_MATCH) {
        sendMessage(room, `${winningTeamId === 1 ? 'Red' : 'Blue'} Team Wins!`, null, COLORS.SUCCESS);
        room.stopGame();
        setMatchActive(false);

        const players = room.getPlayerList();
        const winners = players.filter(p => p.team === winningTeamId).map(p => p.id);
        const losers = players.filter(p => p.team !== 0 && p.team !== winningTeamId).map(p => p.id);
        const specs = players.filter(p => p.team === 0).map(p => p.id);

        mainQueue.handleMatchEnd(winners, losers, specs);

        players.forEach(p => {
            if (winners.includes(p.id)) {
                room.setPlayerTeam(p.id, 1);
                resetAFKTimer(p.id);
            } else {
                room.setPlayerTeam(p.id, 0);
            }
        });

        const activeQueue = mainQueue.getActivePlayers(players);

        if (activeQueue.length < GAME_CONFIG.MIN_PLAYERS_FOR_BIG_MATCH) {
            sendMessage(room, 'Недостатньо граців для великої гри', null, COLORS.INFO);
            GameManager.checkAutoBalance(room);
            return;
        }

        setGameMode(GameMode.CAPTAINS_PICK);
        resetCaptainsState();

        const newBlueCap = activeQueue.find(p => p.team === 0);

        if (newBlueCap) {
            room.setPlayerTeam(newBlueCap.id, 2);
            resetAFKTimer(newBlueCap.id);

            updateCaptainsState({
                redId: null,
                blueId: newBlueCap.id,
                turn: 'BLUE',
                pickTimer: Date.now() + GAME_CONFIG.PICK_TIME_LIMIT_MS,
                availablePlayers: activeQueue.filter(p => p.team === 0 && p.id !== newBlueCap.id).map(p => p.id)
            });

            sendMessage(room, 'Переможешь залишається! Синя команда формується', null, COLORS.ADMIN);

            updateAvatarsForDraft(room);
            promptNextPick(room);

        } else {
            GameManager.checkAutoBalance(room);
        }
    }
};