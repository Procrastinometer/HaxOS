import { RoomObject, PlayerObject } from '../types';
import { adminGuard, handleAdminLogin } from './admin';
import { ChatCommands } from './commands.consts';
import { CommandHandler } from './types';

const commands = new Map<string, CommandHandler>([
  [ChatCommands.ADMIN, handleAdminLogin],

  [ChatCommands.HELP, (player, room) => {
    const commandList = Object.values(ChatCommands).join(', ');
    room.sendChat(`Available commands: ${commandList}`, player.id);
  }],

  [ChatCommands.START, adminGuard((player, room) => {
    room.startGame();
    room.sendChat('️Game force started by admin.', player.id);
  })],

  [ChatCommands.STOP, adminGuard((player, room) => {
    room.stopGame();
    room.sendChat('Game stopped by admin.', player.id);
  })],

  [ChatCommands.STATS, (player, room) => {
    room.sendChat('Stats system is under construction 🏗️', player.id);
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
    room.sendChat(`Unknown command: ${commandName}. Try ${ChatCommands.HELP}`, player.id);
  }
};