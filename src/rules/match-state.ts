import { TeamID } from "../haxball-abstractions/types";

export interface MatchState {
    lastTouchTeam: TeamID | null;
    lastTouchPlayerName: string | null;
    isBallOutOfPlay: boolean;
    restartTeam: TeamID | null;
    lockedBallPosition: { x: number, y: number } | null;
    originalInvMass: number | null;
}

export const matchState: MatchState = {
    lastTouchTeam: null,
    lastTouchPlayerName: null,
    isBallOutOfPlay: false,
    restartTeam: null,
    lockedBallPosition: null,
    originalInvMass: null
};

export const resetMatchState = () => {
    matchState.lastTouchTeam = null;
    matchState.lastTouchPlayerName = null;
    matchState.isBallOutOfPlay = false;
    matchState.restartTeam = null;
    matchState.lockedBallPosition = null;
    matchState.originalInvMass = null;
};

export const setLastTouch = (team: TeamID, name: string) => {
    matchState.lastTouchTeam = team;
    matchState.lastTouchPlayerName = name;
};

export const setRestartTeam = (team: TeamID | null) => {
    matchState.restartTeam = team;
};

export const lockBallAt = (x: number, y: number) => {
    matchState.lockedBallPosition = { x, y };
};