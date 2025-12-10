import { GameState, GameMode, CaptainsState } from './types';

let currentState: GameState = {
    mode: GameMode.WAITING,
    isMatchActive: false,
    captains: {
        redId: null,
        blueId: null,
        turn: 'RED',
        pickTimer: null,
        availablePlayers: []
    }
};

export const getGameState = () => currentState;

export const setGameMode = (mode: GameMode) => {
    currentState.mode = mode;
};

export const setMatchActive = (active: boolean) => {
    currentState.isMatchActive = active;
};

export const updateCaptainsState = (updates: Partial<CaptainsState>) => {
    currentState.captains = { ...currentState.captains, ...updates };
};

export const resetCaptainsState = () => {
    currentState.captains = {
        redId: null,
        blueId: null,
        turn: 'RED',
        pickTimer: null,
        availablePlayers: []
    };
};