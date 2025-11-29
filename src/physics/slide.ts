import { isOnCooldown } from './common';
import { COMMON_PHYSICS, SLIDE_CONFIG } from './configs';
import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { PlayerPhysicsState } from './types';

export const triggerSlide = (room: RoomObject, p: PlayerObject, state: PlayerPhysicsState) => {
  if (isOnCooldown(room, p, state.cooldownUntil)) return;

  const props = room.getPlayerDiscProperties(p.id);

  room.setPlayerDiscProperties(p.id, {
    xspeed: props.xspeed * SLIDE_CONFIG.BOOST,
    yspeed: props.yspeed * SLIDE_CONFIG.BOOST
  });

  const now = Date.now();
  state.slideUntil = now + SLIDE_CONFIG.DURATION;

  state.fatigueUntil = now + SLIDE_CONFIG.DURATION + COMMON_PHYSICS.FATIGUE_DURATION;
  state.cooldownUntil = now + SLIDE_CONFIG.COOLDOWN;
};

export const applySlidePhysics = (room: RoomObject, p: PlayerObject) => {
  const props = room.getPlayerDiscProperties(p.id);
  room.setPlayerDiscProperties(p.id, {
    xgravity: -props.xspeed * SLIDE_CONFIG.DRAG,
    ygravity: -props.yspeed * SLIDE_CONFIG.DRAG,
    damping: COMMON_PHYSICS.NORMAL_DAMPING
  });
  room.setPlayerAvatar(p.id, '👟');
};
