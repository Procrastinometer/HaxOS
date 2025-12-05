export type AFKState = {
    isAfk: boolean;
    afkStartTime: number;
    lastMoveTime: number;
    lastPosition: { x: number, y: number } | null;
    warningSent: boolean;
    lastTeam: TeamID;
};