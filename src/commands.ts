import { RoomObject, PlayerObject } from './types';

type CommandHandler = (player: PlayerObject, room: RoomObject, args: string[]) => void;

const commands = new Map<string, CommandHandler>([
  ['!help', (player, room) => {
    room.sendChat('Commands: !help, !start, !stop, !admin', player.id);
  }],
  ['!start', (player, room) => {
    room.startGame();
    room.sendChat('Game forced start.', player.id);
  }],
  ['!stop', (player, room) => {
    room.stopGame();
    room.sendChat('Game stopped.', player.id);
  }],
  ['!stats', (player, room) => {
    room.sendChat('Stats system is under construction 🏗️', player.id);
  }],
]);

export function handleCommand(player: PlayerObject, message: string, room: RoomObject) {
  const args = message.split(' ');
  const commandName = args[0].toLowerCase();

  const handler = commands.get(commandName);

  if (handler) handler(player, room, args);
  else room.sendChat(`Unknown command: ${commandName}`, player.id);
}