import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';

export const isOnCooldown = (room: RoomObject, p: PlayerObject, cooldownUntil: number): boolean => {
  const now = Date.now();
  if (cooldownUntil > now) {
    const timeLeft = Math.ceil((cooldownUntil - now) / 1000);
    sendMessage(room, `Cooldown: ${timeLeft}s`, p.id, COLORS.INFO, FontStyle.SMALL);

    room.setPlayerAvatar(p.id, '🚫');
    setTimeout(() => room.setPlayerAvatar(p.id, null), 500);

    return true;
  }
  return false;
};

export const applyFatiguePhysics = (room: RoomObject, p: PlayerObject, resistance: number, normalDamping: number) => {
  const props = room.getPlayerDiscProperties(p.id);
  room.setPlayerDiscProperties(p.id, {
    xgravity: -props.xspeed * resistance,
    ygravity: -props.yspeed * resistance,
    damping: normalDamping
  });
  room.setPlayerAvatar(p.id, '🥵');
};