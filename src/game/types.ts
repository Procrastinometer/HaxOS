export enum GameMode {
    WAITING = 'WAITING',
    SMALL_MATCH = 'SMALL_MATCH',
    CAPTAINS_PICK = 'CAPTAINS_PICK',
    BIG_MATCH = 'BIG_MATCH'
}

export interface CaptainsState {
    redId: number | null;
    blueId: number | null;
    turn: 'RED' | 'BLUE';
    pickTimer: number | null;
    availablePlayers: number[];
}

export interface GameState {
    mode: GameMode;
    captains: CaptainsState;
    isMatchActive: boolean;
}