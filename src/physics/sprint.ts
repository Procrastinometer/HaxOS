import { isOnCooldown } from './common';
import { COMMON_PHYSICS, SPRINT_CONFIG } from './configs';
import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { PlayerPhysicsState } from './types';

export const triggerSprint = (room: RoomObject, p: PlayerObject, state: PlayerPhysicsState) => {
  if (isOnCooldown(room, p, state.cooldownUntil)) return;

  const props = room.getPlayerDiscProperties(p.id);
  const magnitude = Math.sqrt(props.xspeed ** 2 + props.yspeed ** 2);

  if (magnitude === 0) return;

  const now = Date.now();
  state.sprintUntil = now + SPRINT_CONFIG.DURATION;
  state.cooldownUntil = now + SPRINT_CONFIG.COOLDOWN;
};

export const applySprintPhysics = (room: RoomObject, p: PlayerObject) => {
  const props = room.getPlayerDiscProperties(p.id);
  const magnitude = Math.sqrt(props.xspeed ** 2 + props.yspeed ** 2);

  if (magnitude > 0) {
    const vecX = props.xspeed / magnitude;
    const vecY = props.yspeed / magnitude;

    room.setPlayerDiscProperties(p.id, {
      xgravity: vecX * SPRINT_CONFIG.FORCE,
      ygravity: vecY * SPRINT_CONFIG.FORCE,
      damping: COMMON_PHYSICS.NORMAL_DAMPING
    });
  }
  room.setPlayerAvatar(p.id, '⚡');
};