import { RoomObject } from '../haxball-abstractions/types';
import { COMMON_PHYSICS, SPRINT_CONFIG, SLIDE_CONFIG } from './configs';
import { getPhysicsState } from './state';
import { applyFatiguePhysics } from './common';
import { applySlidePhysics, triggerSlide } from './slide';
import { applySprintPhysics, triggerSprint } from './sprint';

export const handlePhysicsLogic = (room: RoomObject) => {
  const players = room.getPlayerList();
  const now = Date.now();

  players.forEach((p) => {
    if (p.team === 0) return;

    const state = getPhysicsState(p.id);
    const props = room.getPlayerDiscProperties(p.id);
    if (!props) return;

    if (state.slideUntil > now) {
      applySlidePhysics(room, p);
      return;
    }

    if (state.sprintUntil > now) {
      applySprintPhysics(room, p);
      return;
    }

    if (state.fatigueUntil > now) {
      applyFatiguePhysics(room, p, COMMON_PHYSICS.FATIGUE_RESISTANCE, COMMON_PHYSICS.NORMAL_DAMPING);
      return;
    }

    if ((state.slideUntil || state.fatigueUntil || state.sprintUntil) &&
      (state.slideUntil < now && state.fatigueUntil < now && state.sprintUntil < now)) {

      room.setPlayerDiscProperties(p.id, { xgravity: 0, ygravity: 0 });
      room.setPlayerAvatar(p.id, null);
      state.slideUntil = 0;
      state.sprintUntil = 0;
      state.fatigueUntil = 0;
    }

    const isHoldingKick = props.damping === COMMON_PHYSICS.TRIGGER_DAMPING;

    if (isHoldingKick) {
      state.activation++;

      if (state.activation > SLIDE_CONFIG.ACTIVATION_MIN && state.activation < SPRINT_CONFIG.ACTIVATION_MIN) {
        room.setPlayerAvatar(p.id, '👟');
      } else if (state.activation >= SPRINT_CONFIG.ACTIVATION_MIN && state.activation < SPRINT_CONFIG.ACTIVATION_MAX) {
        room.setPlayerAvatar(p.id, '💨');
      }

    } else {
      if (state.activation >= SPRINT_CONFIG.ACTIVATION_MIN && state.activation < SPRINT_CONFIG.ACTIVATION_MAX) {
        triggerSprint(room, p, state);
      }
      else if (state.activation > SLIDE_CONFIG.ACTIVATION_MIN) {
        triggerSlide(room, p, state);
      }
      else if (state.activation > 0) {
        room.setPlayerAvatar(p.id, null);
      }

      state.activation = 0;
    }
  });
};