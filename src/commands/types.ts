import { PlayerObject, RoomObject } from '../haxball-abstractions/types';

export type CommandHandler = (player: PlayerObject, room: RoomObject, args: string[]) => Promise<void> | void;