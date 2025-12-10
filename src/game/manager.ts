import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { mainQueue } from './queue';
import { getGameState, setGameMode, setMatchActive, resetCaptainsState } from './state';
import { GameMode } from './types';
import { GAME_CONFIG } from './constants';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { startCaptainsDraft } from './captains';
import { resetAFKTimer } from '../afk/state';

export const GameManager = {
    enforceGameIntegrity: (room: RoomObject) => {
        const state = getGameState();
        const players = room.getPlayerList();
        const activePlayers = mainQueue.getActivePlayers(players);
        const activeCount = activePlayers.length;

        if ((state.mode === GameMode.BIG_MATCH || state.mode === GameMode.CAPTAINS_PICK) && activeCount < GAME_CONFIG.MIN_PLAYERS_FOR_BIG_MATCH) {
            downgradeToSmallMatch(room, activePlayers);
            return;
        }

        if (state.isMatchActive) {
            const redCount = players.filter(p => p.team === 1).length;
            const blueCount = players.filter(p => p.team === 2).length;

            if (Math.abs(redCount - blueCount) > 1) {
                sendMessage(room, 'Команди нерівні!', null, COLORS.ERROR, FontStyle.BOLD);
                room.stopGame();
                setMatchActive(false);
                GameManager.checkAutoBalance(room);
                return;
            }

            if ((redCount === 0 || blueCount === 0) && activeCount > 1) {
                room.stopGame();
                setMatchActive(false);
                GameManager.checkAutoBalance(room);
                return;
            }
        }
    },

    checkAutoBalance: (room: RoomObject) => {
        const state = getGameState();

        if (state.mode === GameMode.CAPTAINS_PICK) return;
        if (state.isMatchActive && state.mode === GameMode.BIG_MATCH) return;

        const allPlayers = room.getPlayerList();
        const activePlayers = mainQueue.getActivePlayers(allPlayers);
        const activeCount = activePlayers.length;

        if (activeCount < 2) {
            setGameMode(GameMode.WAITING);
            if (activeCount === 1) {
                const p = activePlayers[0];
                if (p.team !== 1) {
                    room.setPlayerTeam(p.id, 1);
                    resetAFKTimer(p.id);
                }
                if (!state.isMatchActive) {
                    room.startGame();
                    setMatchActive(true);
                }
            } else {
                if (state.isMatchActive) {
                    room.stopGame();
                    setMatchActive(false);
                }
            }
            return;
        }

        if (activeCount >= GAME_CONFIG.MIN_PLAYERS_FOR_BIG_MATCH && state.mode !== GameMode.BIG_MATCH) {
            initCaptainsMode(room);
            return;
        }

        if (state.mode !== GameMode.BIG_MATCH) {
            handleSmallMatch(room, activePlayers);
        }
    }
};

const downgradeToSmallMatch = (room: RoomObject, activePlayers: PlayerObject[]) => {
    sendMessage(room, 'Недостатньбо гравців для великої гри...', null, COLORS.INFO);
    room.stopGame();
    setMatchActive(false);
    resetCaptainsState();
    handleSmallMatch(room, activePlayers);
};

const handleSmallMatch = (room: RoomObject, activePlayers: PlayerObject[]) => {
    const state = getGameState();
    const count = activePlayers.length;
    const playersToPlay = count % 2 === 0 ? count : count - 1;

    const redTeam = room.getPlayerList().filter(p => p.team === 1);
    const blueTeam = room.getPlayerList().filter(p => p.team === 2);
    const totalOnField = redTeam.length + blueTeam.length;

    if (state.isMatchActive && totalOnField === playersToPlay && Math.abs(redTeam.length - blueTeam.length) <= 1) {
        return;
    }

    setGameMode(GameMode.SMALL_MATCH);
    if (room.getScores() !== null) room.stopGame();

    room.getPlayerList().forEach(p => room.setPlayerTeam(p.id, 0));

    const playingSquad = activePlayers.slice(0, playersToPlay);
    const half = playersToPlay / 2;

    playingSquad.forEach((p, index) => {
        const targetTeam = index < half ? 1 : 2;
        room.setPlayerTeam(p.id, targetTeam);
        resetAFKTimer(p.id);
    });

    sendMessage(room, `Запускається мала гра ${half}v${half}!`, null, COLORS.SUCCESS, FontStyle.BOLD);
    room.startGame();
    setMatchActive(true);
};

export const initCaptainsMode = (room: RoomObject) => {
    const state = getGameState();
    if (state.mode === GameMode.CAPTAINS_PICK) return;

    room.stopGame();
    setGameMode(GameMode.CAPTAINS_PICK);
    setMatchActive(false);

    sendMessage(room, 'Достатньо гравців для великої гри!', null, COLORS.ADMIN, FontStyle.BOLD);
    startCaptainsDraft(room);
};