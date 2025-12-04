import { sendMessage } from './utils/send-message';
const HaxballJS = require('haxball.js');
import fs from 'node:fs';
import path from 'node:path';
import { HAXOS_CONFIG } from './room.config';
import { handleCommand } from './commands/commands-handler';
import { COLORS } from './utils/colors';
import { FontStyle } from './utils/font.types';
import { RoomObject, PlayerObject, HBInitFunction } from './haxball-abstractions/types';
import { handlePhysicsLogic } from './physics/engine';
import { clearPhysicsState } from './physics/state';

import { enforceDistance } from './rules/border';
import { checkRules } from './rules/out';
import { matchState, resetMatchState, setLastTouch, setRestartTeam } from './rules/match-state';
import { detectRicochet } from './rules/ricochet';

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

    sendMessage(room, `Welcome to Real Soccer 7v7, ${player.name}!`, null);
    sendMessage(room, `Powered by HaxOS. Type !help`, player.id, 0xADD8E6, FontStyle.SMALL);

    if (player.name === 'admin') {
      room.setPlayerAdmin(player.id, true);
    }
  };

  room.onPlayerLeave = (player: PlayerObject) => {
    console.log(`[-] ${player.name} (ID: ${player.id}) disconnected.`);
    clearPhysicsState(player.id);
  };

  room.onPlayerChat = (player: PlayerObject, message: string) => {
    console.log(`[CHAT] ${player.name}: ${message}`);

    if (message.startsWith('!')) {
      handleCommand(player, message, room);

      return false;
    }
    return true;
  };

  room.onGameTick = () => {
    handlePhysicsLogic(room);
  };

  room.onGameStart = (byPlayer: PlayerObject | null) => {
    const starterName = byPlayer ? byPlayer.name : 'System (HaxOS)';
    console.log(`Match started by ${starterName}`);
    resetMatchState();
    sendMessage(room, 'The match has begun! Play fair.', null, COLORS.SERVER, FontStyle.BOLD);
  };

    room.onGameStop = () => {
        resetMatchState();
    };

    room.onTeamGoal = () => {
        resetMatchState();
    };

    room.onPlayerBallKick = (player: PlayerObject) => {
        if (matchState.restartTeam !== null) {
            if (player.team === matchState.restartTeam) {
                setRestartTeam(null);
            } else {
                return;
            }
        }

        setLastTouch(player.team, player.name);
    };

    room.onGameTick = () => {
        handlePhysicsLogic(room);
        detectRicochet(room);
        checkRules(room);
        enforceDistance(room);

        if (matchState.lockedBallPosition) {
            const ball = room.getDiscProperties(0);

            const dx = ball.x - matchState.lockedBallPosition.x;
            const dy = ball.y - matchState.lockedBallPosition.y;

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || ball.xspeed !== 0 || ball.yspeed !== 0) {
                room.setDiscProperties(0, {
                    x: matchState.lockedBallPosition.x,
                    y: matchState.lockedBallPosition.y,
                    xspeed: 0,
                    yspeed: 0
                });
            }
        }
    }
});