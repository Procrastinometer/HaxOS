import { COLORS } from './colors';
import { FontStyle } from './font.types';
import { RoomObject } from '../haxball-abstractions/types';

export const sendMessage = (
  room: RoomObject,
  msg: string,
  playerID: number | null = null,
  color: number = COLORS.SERVER,
  style: FontStyle = 'normal',
) => {
  if (playerID !== null) room.sendAnnouncement(`[DM] ${msg}`, playerID, color, style, 2);
  else room.sendAnnouncement(`[HaxOS] ${msg}`, null, color, style, 1);
};
