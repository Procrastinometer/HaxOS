import { PlayerPhysicsState } from './types';

const playerStates = new Map<number, PlayerPhysicsState>();

export const initPhysicsState = (id: number) => {
  playerStates.set(id, {
    activation: 0,
    cooldownUntil: 0,
    isSprinting: false,
    sprintUntil: 0,
    slideUntil: 0,
    fatigueUntil: 0,
  });
};

export const clearPhysicsState = (id: number) => {
  playerStates.delete(id);
};

export const getPhysicsState = (id: number): PlayerPhysicsState => {
  let state = playerStates.get(id);
  if (!state) {
    initPhysicsState(id);
    state = playerStates.get(id)!;
  }
  return state;
};