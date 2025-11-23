const HaxballJS = require('haxball.js');
import fs from 'node:fs';
import path from 'node:path';

import { RoomObject, PlayerObject, HBInitFunction } from './types';
import { HAXOS_CONFIG } from './room.config';
import { handleCommand } from './commands/commands-handler';

const CUSTOM_STADIUM_FILE = 'uamap.hbs';
const CUSTOM_STADIUM_PATH = path.join(__dirname, '..', 'maps', CUSTOM_STADIUM_FILE);
console.clear();

HaxballJS().then((HBInit: HBInitFunction) => {
  const room: RoomObject = HBInit(HAXOS_CONFIG);

  room.onRoomLink = (link: string) => {
    console.log(`\n HaxOS Online!`);
    console.log(` Link: ${link}`);
    console.log(`----------------------------------------`);
  };

  try {
    const stadiumXml = fs.readFileSync(CUSTOM_STADIUM_PATH, 'utf8');
    room.setCustomStadium(stadiumXml);
    console.log(`Successfully loaded custom stadium: ${CUSTOM_STADIUM_FILE}`);
  } catch (error) {
    console.error(`ERROR: Could not load custom stadium from ${CUSTOM_STADIUM_FILE}. Falling back to default.`);
    console.error(error);
    room.setDefaultStadium('Big');
  }

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
    const starterName = byPlayer ? byPlayer.name : 'System (HaxOS)';

    console.log(`Match started by ${starterName}`);
    room.sendChat('The match has begun! Play fair.');
  };
});