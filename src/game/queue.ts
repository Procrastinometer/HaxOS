import { PlayerObject } from '../haxball-abstractions/types';
import { getAFKState } from '../afk/state';

export class PlayerQueue {
    private queue: number[] = [];

    addPlayer(id: number) {
        if (!this.queue.includes(id)) {
            this.queue.push(id);
        }
    }

    removePlayer(id: number) {
        this.queue = this.queue.filter(playerId => playerId !== id);
    }

    getActivePlayers(roomPlayers: PlayerObject[]): PlayerObject[] {
        const activeIds: number[] = [];

        for (const id of this.queue) {
            const player = roomPlayers.find(p => p.id === id);
            if (!player) continue; // Гравця вже немає в кімнаті

            const afkState = getAFKState(id);
            if (!afkState.isAfk) {
                activeIds.push(id);
            }
        }

        return activeIds.map(id => roomPlayers.find(p => p.id === id)!);
    }

    getAllPlayers(roomPlayers: PlayerObject[]): PlayerObject[] {
        return this.queue
            .map(id => roomPlayers.find(p => p.id === id))
            .filter((p): p is PlayerObject => !!p);
    }

    handleMatchEnd(winners: number[], losers: number[], specs: number[]) {
        const newQueue: number[] = [
            ...specs,
            ...winners,
            ...losers
        ];

        const others = this.queue.filter(id => !newQueue.includes(id));

        this.queue = [...newQueue, ...others];
    }

    promoteToTop(id: number) {
        if (this.queue.includes(id)) {
            this.removePlayer(id);
            this.queue.unshift(id);
        }
    }
}

export const mainQueue = new PlayerQueue();