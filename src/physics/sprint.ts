import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { PHYSICS_CONFIG } from './configs';
import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { PlayerPhysicsState } from './types';

const playerStates = new Map<number, PlayerPhysicsState>();

export const initPhysicsState = (id: number) => {
  playerStates.set(id, {
    activation: 0,
    cooldownUntil: 0,
    isSprinting: false,
    sprintUntil: 0,
    fatigueUntil: 0,
  });
};

export const clearPhysicsState = (id: number) => {
  playerStates.delete(id);
};

export const handleSprintLogic = (room: RoomObject) => {
  const players = room.getPlayerList();
  const now = Date.now();

  players.forEach((p) => {
    if (p.team === 0) return;

    let state = playerStates.get(p.id);
    if (!state) {
      initPhysicsState(p.id);
      state = playerStates.get(p.id)!;
    }

    const props = room.getPlayerDiscProperties(p.id);
    if (!props) return;

    if (state.sprintUntil > now) {
      const magnitude = Math.sqrt(props.xspeed ** 2 + props.yspeed ** 2);
      if (magnitude > 0) {
        const vecX = props.xspeed / magnitude;
        const vecY = props.yspeed / magnitude;

        room.setPlayerDiscProperties(p.id, {
          xgravity: vecX * PHYSICS_CONFIG.SPRINT_FORCE,
          ygravity: vecY * PHYSICS_CONFIG.SPRINT_FORCE,
          damping: PHYSICS_CONFIG.NORMAL_DAMPING
        });
      }
      room.setPlayerAvatar(p.id, '⚡');
      return;
    }

    if (state.fatigueUntil > now) {
      room.setPlayerDiscProperties(p.id, {
        xgravity: -props.xspeed * PHYSICS_CONFIG.FATIGUE_RESISTANCE,
        ygravity: -props.yspeed * PHYSICS_CONFIG.FATIGUE_RESISTANCE,
        damping: PHYSICS_CONFIG.NORMAL_DAMPING
      });
      room.setPlayerAvatar(p.id, '🥵');
      return;
    }

    if (state.fatigueUntil !== 0 && state.fatigueUntil < now) {
      room.setPlayerDiscProperties(p.id, {
        xgravity: 0,
        ygravity: 0,
        damping: PHYSICS_CONFIG.NORMAL_DAMPING
      });
      room.setPlayerAvatar(p.id, null);

      state.fatigueUntil = 0;
      state.sprintUntil = 0;
    }

    const isHoldingKick = props.damping === PHYSICS_CONFIG.TRIGGER_DAMPING;

    if (isHoldingKick) {
      state.activation++;

      if (state.activation > 20 && state.activation < 60) {
        room.setPlayerAvatar(p.id, '👟');
      } else if (state.activation >= 60 && state.activation < 100) {
        room.setPlayerAvatar(p.id, '💨');
      }

    } else {
      if (state.activation >= 60 && state.activation < 100) {
        triggerSprint(room, p, state);
      } else if (state.activation > 0) {
        room.setPlayerAvatar(p.id, null);
      }

      state.activation = 0;
    }
  });
};

const triggerSprint = (room: RoomObject, p: PlayerObject, state: PlayerPhysicsState) => {
  const now = Date.now();

  if (state.cooldownUntil > now) {
    const timeLeft = Math.ceil((state.cooldownUntil - now) / 1000);
    sendMessage(room, `Cooldown: ${timeLeft}s`, p.id, COLORS.INFO, FontStyle.SMALL);
    room.setPlayerAvatar(p.id, '🚫');
    setTimeout(() => room.setPlayerAvatar(p.id, null), 500);
    return;
  }

  const props = room.getPlayerDiscProperties(p.id);
  const magnitude = Math.sqrt(props.xspeed ** 2 + props.yspeed ** 2);

  if (magnitude === 0) return;

  state.sprintUntil = now + PHYSICS_CONFIG.SPRINT_DURATION;

  state.fatigueUntil = now + PHYSICS_CONFIG.SPRINT_DURATION + PHYSICS_CONFIG.FATIGUE_DURATION;

  state.cooldownUntil = now + PHYSICS_CONFIG.COOLDOWN;
};