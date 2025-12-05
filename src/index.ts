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

import { initAFKState, clearAFKState } from './afk/state';
import { watchAFK } from './afk/watcher';

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

      initAFKState(player.id);

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
    clearAFKState(player.id);
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

                const mass = matchState.originalInvMass ?? 1;

                setRestartTeam(null);
                matchState.lockedBallPosition = null;

                const ball = room.getDiscProperties(0);

                if (player.position) {
                    const dx = ball.x - player.position.x;
                    const dy = ball.y - player.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 0) {
                        const kickPower = 11;

                        const velX = (dx / dist) * kickPower;
                        const velY = (dy / dist) * kickPower;

                        room.setDiscProperties(0, {
                            invMass: mass,
                            xspeed: velX,
                            yspeed: velY
                        });
                    } else {
                        room.setDiscProperties(0, { invMass: mass });
                    }
                }

            } else {
                return;
            }
        }

        setLastTouch(player.team, player.name);
    };

    room.onGameTick = () => {
        handlePhysicsLogic(room);
        watchAFK(room);
        detectRicochet(room);
        checkRules(room);
        enforceDistance(room);

        if (matchState.lockedBallPosition) {
            room.setDiscProperties(0, {
                x: matchState.lockedBallPosition.x,
                y: matchState.lockedBallPosition.y,
                xspeed: 0,
                yspeed: 0
            });
        }
    };
});