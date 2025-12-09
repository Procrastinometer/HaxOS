import { CommandHandler } from './types';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { getAFKState } from '../afk/state';
import { AFK_CONFIG } from '../afk/config';

export const handleAFKCommand: CommandHandler = (player, room) => {
    const state = getAFKState(player.id);
    const now = Date.now();

    if (state.isAfk) {
        const timeInAfk = now - state.afkStartTime;
        const timeLeft = Math.ceil((AFK_CONFIG.MIN_AFK_DURATION - timeInAfk) / 1000);

        if (timeLeft > 0) {
            sendMessage(room, `Почекай ${timeLeft}с, щоб вийти з АФК`, player.id, COLORS.ERROR, FontStyle.SMALL);
            return;
        }

        state.isAfk = false;
        state.lastMoveTime = now;
        state.warningSent = false;
        sendMessage(room, `${player.name} тепер не АФК`, null, COLORS.SUCCESS, FontStyle.NORMAL);

    } else {
        state.isAfk = true;
        state.afkStartTime = now;
        room.setPlayerTeam(player.id, 0);
        sendMessage(room, `${player.name} АФК`, null, COLORS.INFO, FontStyle.ITALIC);
    }
};