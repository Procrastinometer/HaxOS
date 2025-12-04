import { TeamID } from "../haxball-abstractions/types";

export interface MatchState {
    lastTouchTeam: TeamID | null;
    lastTouchPlayerName: string | null;
    isBallOutOfPlay: boolean;
}

export const matchState: MatchState = {
    lastTouchTeam: null,
    lastTouchPlayerName: null,
    isBallOutOfPlay: false
};

export const resetMatchState = () => {
    matchState.lastTouchTeam = null;
    matchState.lastTouchPlayerName = null;
    matchState.isBallOutOfPlay = false;
};

export const setLastTouch = (team: TeamID, name: string) => {
    matchState.lastTouchTeam = team;
    matchState.lastTouchPlayerName = name;
};