import { RoomObject, TeamID } from '../haxball-abstractions/types';
import { matchState, setRestartTeam, lockBallAt } from './match-state';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';

const FIELD = {
    W: 1150,
    H: 600,
    GOAL_Y: 124
};

export const checkRules = (room: RoomObject) => {
    if (matchState.isBallOutOfPlay) return;
    const ball = room.getDiscProperties(0);
    if (!ball) return;
    if (Math.abs(ball.y) > FIELD.H + ball.radius) {
        handleBallOut(room, ball.x, ball.y, 'side');
        return;
    }
    if (Math.abs(ball.x) > FIELD.W + ball.radius) {
        if (Math.abs(ball.y) > FIELD.GOAL_Y) {
            handleBallOut(room, ball.x, ball.y, 'end');
            return;
        }
    }
};

const handleBallOut = (room: RoomObject, x: number, y: number, type: 'side' | 'end') => {
    matchState.isBallOutOfPlay = true;

    const currentBall = room.getDiscProperties(0);
    if (currentBall.invMass !== 0) {
        matchState.originalInvMass = currentBall.invMass;
    }

    room.setDiscProperties(0, { xspeed: 0, yspeed: 0 });

    const lastTeam = matchState.lastTouchTeam;
    if (!lastTeam) {
        resetBall(room, 0, 0);
        return;
    }

    const oppositeTeam: TeamID = lastTeam === 1 ? 2 : 1;
    setRestartTeam(oppositeTeam);

    const teamName = oppositeTeam === 1 ? "RED" : "BLUE";
    const teamColor = oppositeTeam === 1 ? COLORS.ERROR : COLORS.DM;

    if (type === 'side') {
        const placeY = Math.sign(y) * (FIELD.H - 10);
        const placeX = x;
        sendMessage(room, `⚽ THROW-IN for ${teamName}`, null, teamColor, 'bold');
        placeBall(room, placeX, placeY);
    }
    else if (type === 'end') {
        const side = Math.sign(x);
        const isDefenseSide = (side === -1 && lastTeam === 1) || (side === 1 && lastTeam === 2);

        if (isDefenseSide) {
            sendMessage(room, `⛳ CORNER KICK for ${teamName}`, null, teamColor, 'bold');
            const cornerY = Math.sign(y) * (FIELD.H - 20);
            const cornerX = side * (FIELD.W - 20);
            placeBall(room, cornerX, cornerY);
        } else {
            const goalKickTeamID: TeamID = side === -1 ? 1 : 2;
            const goalKickTeamName = goalKickTeamID === 1 ? 'RED' : 'BLUE';
            setRestartTeam(goalKickTeamID);
            sendMessage(room, `🥅 GOAL KICK for ${goalKickTeamName}`, null, COLORS.SERVER, 'bold');
            const goalKickX = side * (FIELD.W - 100);
            const goalKickY = Math.sign(y) * 80;
            placeBall(room, goalKickX, goalKickY);
        }
    }
};

const placeBall = (room: RoomObject, x: number, y: number) => {
    setTimeout(() => {
        room.setDiscProperties(0, {
            x: x,
            y: y,
            xspeed: 0,
            yspeed: 0,
            invMass: 0
        });

        lockBallAt(x, y);

        matchState.isBallOutOfPlay = false;
        sendMessage(room, "GO!", null, COLORS.SUCCESS, 'small-bold');
    }, 1000);
};

const resetBall = (room: RoomObject, x: number, y: number) => {
    const mass = matchState.originalInvMass ?? 1;
    room.setDiscProperties(0, { x, y, xspeed: 0, yspeed: 0, invMass: mass });

    matchState.isBallOutOfPlay = false;
    setRestartTeam(null);
};