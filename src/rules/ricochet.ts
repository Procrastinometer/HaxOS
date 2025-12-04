import { RoomObject } from '../haxball-abstractions/types';
import { matchState, setLastTouch } from './match-state';

export const detectRicochet = (room: RoomObject) => {
    if (matchState.isBallOutOfPlay || matchState.lockedBallPosition) return;

    const ball = room.getDiscProperties(0);
    const players = room.getPlayerList();

    const PLAYER_RADIUS = 15;

    const COLLISION_THRESHOLD = ball.radius + PLAYER_RADIUS + 0.1;

    for (const player of players) {
        if (player.team === 0 || !player.position) continue;

        const dx = player.position.x - ball.x;
        const dy = player.position.y - ball.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= COLLISION_THRESHOLD) {
            setLastTouch(player.team, player.name);
        }
    }
};