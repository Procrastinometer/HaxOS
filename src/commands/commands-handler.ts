import { adminGuard, handleAdminLogin } from './admin';
import { ChatCommands } from './commands.consts';
import { CommandHandler } from './types';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { PlayerObject, RoomObject } from '../haxball-abstractions/types';

const commands = new Map<string, CommandHandler>([
  [ChatCommands.ADMIN, handleAdminLogin],

  [ChatCommands.HELP, (player, room) => {
    const commandList = Object.values(ChatCommands).join(', ');
    sendMessage(room, `Available commands: ${commandList}`, player.id, COLORS.INFO, FontStyle.BOLD);
  }],

  [ChatCommands.START, adminGuard((_, room) => {
    room.startGame();
    sendMessage(room, 'Game force started by admin.', null, COLORS.SUCCESS, FontStyle.BOLD);
  })],

  [ChatCommands.STOP, adminGuard((_, room) => {
    room.stopGame();
    sendMessage(room, 'Game stopped by admin.', null, COLORS.ERROR, FontStyle.BOLD);
  })],

  [ChatCommands.STATS, (player, room) => {
    sendMessage(room, 'Stats system is under construction️', player.id, COLORS.INFO, FontStyle.ITALIC);
  }],
]);

export const handleCommand = (player: PlayerObject, message: string, room: RoomObject) => {
  const args = message.split(' ');
  const commandName = args[0].toLowerCase();

  const handler = commands.get(commandName);

  if (handler) {
    Promise.resolve(handler(player, room, args)).catch(err => {
      console.error(`Error executing ${commandName}:`, err);
    });
  } else {
    sendMessage(room, `Unknown command: ${commandName}. Try ${ChatCommands.HELP}`, player.id, COLORS.ERROR);
  }
};