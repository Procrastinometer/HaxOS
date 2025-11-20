const HaxballJS = require('haxball.js');
import { RoomObject, PlayerObject, HBInitFunction } from './types';
import { HAXOS_CONFIG } from './room.config';
import { handleCommand } from './commands';

console.clear();
console.log('🖥️  Booting HaxOS Kernel...');
console.log('⏳ Connecting to HaxBall Master Server...');

HaxballJS().then((HBInit: HBInitFunction) => {
  const room: RoomObject = HBInit(HAXOS_CONFIG);

  room.onRoomLink = (link: string) => {
    console.log(`\n✅ HaxOS Online!`);
    console.log(`🔗 Link: ${link}`);
    console.log(`----------------------------------------`);
  };

  room.onPlayerJoin = (player: PlayerObject) => {
    console.log(`[+] ${player.name} (ID: ${player.id}) connected.`);

    room.sendChat(`Welcome to Real Soccer 7v7, ${player.name}!`, player.id);
    room.sendChat(`Powered by HaxOS. Type !help for commands.`, player.id);

    if (player.name === 'admin') {
      room.setPlayerAdmin(player.id, true);
    }
  };

  room.onPlayerLeave = (player: PlayerObject) => {
    console.log(`[-] ${player.name} (ID: ${player.id}) disconnected.`);
  };

  room.onPlayerChat = (player: PlayerObject, message: string) => {
    console.log(`[CHAT] ${player.name}: ${message}`);

    if (message.startsWith('!')) {
      handleCommand(player, message, room);
      return false;
    }
    return true;
  };

  room.onGameStart = (byPlayer: PlayerObject | null) => {
    const starterName = byPlayer ? byPlayer.name : "System (HaxOS)";

    console.log(`⚽ Match started by ${starterName}`);
    room.sendChat('The match has begun! Play fair.');
  };
});