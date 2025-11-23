import { PlayerObject, RoomObject } from '../types';

export type CommandHandler = (player: PlayerObject, room: RoomObject, args: string[]) => Promise<void> | void;