import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { getGameState, updateCaptainsState, setMatchActive, setGameMode, resetCaptainsState } from './state';
import { GameMode } from './types';
import { GAME_CONFIG } from './constants';
import { mainQueue } from './queue';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { resetAFKTimer } from '../afk/state';

export const startCaptainsDraft = (room: RoomObject) => {
    const allPlayers = room.getPlayerList();
    const activePlayers = mainQueue.getActivePlayers(allPlayers);

    if (activePlayers.length < 2) return;

    const redCap = activePlayers[0];
    const blueCap = activePlayers[1];

    room.getPlayerList().forEach(p => room.setPlayerTeam(p.id, 0));

    room.setPlayerTeam(redCap.id, 1);
    resetAFKTimer(redCap.id);

    room.setPlayerTeam(blueCap.id, 2);
    resetAFKTimer(blueCap.id);

    resetCaptainsState();
    updateCaptainsState({
        redId: redCap.id,
        blueId: blueCap.id,
        turn: 'RED',
        pickTimer: Date.now() + GAME_CONFIG.PICK_TIME_LIMIT_MS,
        availablePlayers: activePlayers.slice(2).map(p => p.id)
    });

    sendMessage(room, 'Розподіл гравців почато!', null, COLORS.ADMIN, FontStyle.BOLD);
    sendMessage(room, `🔴 Капітан червоних: ${redCap.name}`, null, COLORS.ERROR);
    sendMessage(room, `🔵 Капітан синіх: ${blueCap.name}`, null, COLORS.DM);

    updateAvatarsForDraft(room);
    promptNextPick(room);
};

export const addPlayerToDraft = (room: RoomObject, player: PlayerObject) => {
    const state = getGameState();
    if (state.mode !== GameMode.CAPTAINS_PICK) return;

    const newAvailable = [...state.captains.availablePlayers, player.id];
    updateCaptainsState({ availablePlayers: newAvailable });

    room.setPlayerTeam(player.id, 0);

    sendMessage(room, `➕ ${player.name} був доданий до списку!`, null, COLORS.SUCCESS);

    updateAvatarsForDraft(room);
    promptNextPick(room);
};

export const updateAvatarsForDraft = (room: RoomObject) => {
    const state = getGameState();
    const players = room.getPlayerList();

    players.forEach(p => room.setPlayerAvatar(p.id, null));

    state.captains.availablePlayers.forEach((pid, index) => {
        room.setPlayerAvatar(pid, (index + 1).toString());
    });
};

export const promptNextPick = (room: RoomObject) => {
    const state = getGameState();
    const capId = state.captains.turn === 'RED' ? state.captains.redId : state.captains.blueId;
    if (!capId) return;

    const availableList = state.captains.availablePlayers
        .map((pid, idx) => {
            const p = room.getPlayer(pid);
            return p ? `[${idx + 1}] ${p.name}` : null;
        })
        .filter(Boolean)
        .join('  |  ');

    sendMessage(room, `${state.captains.turn}, обирай гравця:`, null, COLORS.INFO, FontStyle.BOLD);

    if (availableList.length > 0) {
        sendMessage(room, availableList, capId, COLORS.INFO, FontStyle.SMALL);
    } else {
        sendMessage(room, "Немає кого обрати", capId, COLORS.ERROR, FontStyle.SMALL);
    }

    sendMessage(room, `Щоб обрати, просто напишу цифру (наприклад 1)`, capId, COLORS.ERROR, FontStyle.SMALL_BOLD);
};

export const handleDraftChat = (player: PlayerObject, message: string, room: RoomObject): boolean => {
    const state = getGameState();
    const currentCapId = state.captains.turn === 'RED' ? state.captains.redId : state.captains.blueId;

    if (player.id !== currentCapId) return true;

    if (!/^\d+$/.test(message.trim())) return true;

    const pickIndex = parseInt(message.trim()) - 1;

    if (pickIndex < 0 || pickIndex >= state.captains.availablePlayers.length) {
        sendMessage(room, 'Такого гравця немає!', player.id, COLORS.ERROR);
        return false;
    }

    const pickedPlayerId = state.captains.availablePlayers[pickIndex];
    const pickedPlayer = room.getPlayer(pickedPlayerId);

    if (!pickedPlayer) return false;

    const teamId = state.captains.turn === 'RED' ? 1 : 2;
    room.setPlayerTeam(pickedPlayer.id, teamId);
    resetAFKTimer(pickedPlayer.id);

    sendMessage(room, `${pickedPlayer.name} переходить до ${state.captains.turn} команди!`, null, COLORS.SUCCESS);

    const newAvailable = state.captains.availablePlayers.filter(id => id !== pickedPlayerId);
    const nextTurn = state.captains.turn === 'RED' ? 'BLUE' : 'RED';

    updateCaptainsState({
        availablePlayers: newAvailable,
        turn: nextTurn,
        pickTimer: Date.now() + GAME_CONFIG.PICK_TIME_LIMIT_MS
    });

    const redCount = room.getPlayerList().filter(p => p.team === 1).length;
    const blueCount = room.getPlayerList().filter(p => p.team === 2).length;

    if ((redCount >= GAME_CONFIG.MAX_TEAM_SIZE && blueCount >= GAME_CONFIG.MAX_TEAM_SIZE) || newAvailable.length === 0) {
        finishDraft(room);
    } else {
        updateAvatarsForDraft(room);
        promptNextPick(room);
    }

    return false;
};

const finishDraft = (room: RoomObject) => {
    setGameMode(GameMode.BIG_MATCH);
    room.getPlayerList().forEach(p => room.setPlayerAvatar(p.id, null));
    sendMessage(room, 'Команди готові, гра почалась!', null, COLORS.SERVER, FontStyle.BOLD);
    room.startGame();
    setMatchActive(true);
};

export const checkDraftTimeout = (room: RoomObject) => {
    const state = getGameState();
    if (state.mode !== GameMode.CAPTAINS_PICK || !state.captains.pickTimer) return;

    if (Date.now() > state.captains.pickTimer) {
        const currentCapId = state.captains.turn === 'RED' ? state.captains.redId : state.captains.blueId;
        if (currentCapId) {
            sendMessage(room, 'Час вийшов, капітан нікого не обрав.', null, COLORS.ERROR, FontStyle.BOLD);
            room.kickPlayer(currentCapId, 'Ти нікого не обрав', false);
        }
    }
};