import { RoomObject } from '../haxball-abstractions/types';
import { getAFKState } from './state';
import { AFK_CONFIG } from './config';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';

export const watchAFK = (room: RoomObject) => {
    const players = room.getPlayerList();
    const now = Date.now();

    players.forEach(player => {
        if (player.admin) return;

        const state = getAFKState(player.id);

        if (state.lastTeam === 0 && player.team !== 0) {
            state.lastMoveTime = now;
            state.warningSent = false;
        }
        state.lastTeam = player.team;

        if (player.team === 0 || state.isAfk) return;

        let isActive = false;

        if (player.input) {
            if (player.input.left || player.input.right || player.input.up || player.input.down || player.input.shoot) {
                isActive = true;
            }
        }

        if (!isActive && player.position && state.lastPosition) {
            const dx = player.position.x - state.lastPosition.x;
            const dy = player.position.y - state.lastPosition.y;
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                isActive = true;
            }
        }

        if (player.position) {
            state.lastPosition = { x: player.position.x, y: player.position.y };
        }

        if (isActive) {
            state.lastMoveTime = now;
            state.warningSent = false;
        }

        const idleTime = now - state.lastMoveTime;

        if (idleTime > AFK_CONFIG.IDLE_WARNING_TIME && idleTime < AFK_CONFIG.IDLE_ACTION_TIME && !state.warningSent) {
            sendMessage(room, 'Рухайся, щоб не перейти в АФК, у тебе 4 секунди!', player.id, COLORS.ERROR, FontStyle.BOLD);
            state.warningSent = true;
        }

        if (idleTime > AFK_CONFIG.IDLE_ACTION_TIME) {
            state.isAfk = true;
            state.afkStartTime = now;
            room.setPlayerTeam(player.id, 0);
            sendMessage(room, `${player.name} АФК`, null, COLORS.INFO, FontStyle.SMALL_ITALIC);
        }
    });
};