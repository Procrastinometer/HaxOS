import { RoomObject, PlayerObject } from '../haxball-abstractions/types';
import { matchState } from './match-state';

const MIN_DISTANCE = 150;

export const enforceDistance = (room: RoomObject) => {
    if (matchState.restartTeam === null) return;

    const ball = room.getDiscProperties(0);
    const players = room.getPlayerList();

    players.forEach((player) => {
        if (player.team === matchState.restartTeam || player.team === 0) return;

        if (!player.position) return;

        const dx = player.position.x - ball.x;
        const dy = player.position.y - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MIN_DISTANCE) {
            const pushFactor = 6;
            const velocityX = (dx / dist) * pushFactor;
            const velocityY = (dy / dist) * pushFactor;

            room.setPlayerDiscProperties(player.id, {
                xspeed: velocityX,
                yspeed: velocityY
            });
        }
    });
};