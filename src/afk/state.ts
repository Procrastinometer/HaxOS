import { AFKState } from './types';

const afkStates = new Map<number, AFKState>();

export const initAFKState = (id: number) => {
    afkStates.set(id, {
        isAfk: false,
        afkStartTime: 0,
        lastMoveTime: Date.now(),
        lastPosition: null,
        warningSent: false,
        lastTeam: 0
    });
};

export const clearAFKState = (id: number) => {
    afkStates.delete(id);
};

export const getAFKState = (id: number): AFKState => {
    let state = afkStates.get(id);
    if (!state) {
        initAFKState(id);
        state = afkStates.get(id)!;
    }
    return state;
};