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
import { GameManager } from './game/manager';
import { mainQueue } from './game/queue';
import { handleBigMatchLeaver, handleGameEnd } from './game/events';
import { checkDraftTimeout, handleDraftChat, startCaptainsDraft, addPlayerToDraft } from './game/captains';
import { getGameState } from './game/state';
import { GameMode } from './game/types';

const CUSTOM_STADIUM_FILE = 'uamap.hbs';
const CUSTOM_STADIUM_PATH = path.join(__dirname, '..', 'maps', CUSTOM_STADIUM_FILE);
console.clear();

HaxballJS().then((HBInit: HBInitFunction) => {
    const room: RoomObject = HBInit(HAXOS_CONFIG);

    room.onRoomLink = (link: string) => {
        console.log('\n HaxOS Online!');
        console.log(` Link: ${link}`);
        console.log(' ----- ');
    };

    try {
        const stadiumXml = fs.readFileSync(CUSTOM_STADIUM_PATH, 'utf8');
        room.setCustomStadium(stadiumXml);
        console.log(`Successfully loaded custom stadium: ${CUSTOM_STADIUM_FILE}`);
    } catch (error) {
        console.error(`ERROR: Could not load custom stadium. Using Default.`);
        room.setDefaultStadium('Big');
    }

    (room as any).onPlayerTeamChange = (changedPlayer: PlayerObject, byPlayer: PlayerObject | null) => {
        if (byPlayer !== null) {
            const state = getGameState();
            if (state.mode !== GameMode.WAITING) {
                room.setPlayerTeam(changedPlayer.id, 0);
                sendMessage(room, 'Manual team selection is disabled!', changedPlayer.id, COLORS.ERROR, FontStyle.SMALL);
            }
        }
    };

    room.onPlayerJoin = (player: PlayerObject) => {
        console.log(`[+] ${player.name} (ID: ${player.id}) connected.`);
        initAFKState(player.id);
        mainQueue.addPlayer(player.id);
        sendMessage(room, `Welcome, ${player.name}!`, null);

        if (player.name === 'admin') {
            room.setPlayerAdmin(player.id, true);
        }

        const state = getGameState();
        if (state.mode === GameMode.CAPTAINS_PICK) {
            addPlayerToDraft(room, player);
        } else {
            GameManager.checkAutoBalance(room);
        }
    };

    room.onPlayerLeave = (player: PlayerObject) => {
        console.log(`[-] ${player.name} (ID: ${player.id}) disconnected.`);
        clearPhysicsState(player.id);
        clearAFKState(player.id);
        mainQueue.removePlayer(player.id);

        const state = getGameState();
        if (state.mode === GameMode.CAPTAINS_PICK) {
            if (state.captains.redId === player.id || state.captains.blueId === player.id) {
                sendMessage(room, 'Captain left! Restarting draft...', null, COLORS.ERROR);
                startCaptainsDraft(room);
            }
        }
        else if (state.mode === GameMode.BIG_MATCH) {
            handleBigMatchLeaver(room, player);
        }
        else {
            GameManager.checkAutoBalance(room);
        }
    };

    room.onPlayerChat = (player: PlayerObject, message: string) => {
        console.log(`[CHAT] ${player.name}: ${message}`);

        const state = getGameState();
        if (state.mode === GameMode.CAPTAINS_PICK) {
            const shouldPassThrough = handleDraftChat(player, message, room);
            if (!shouldPassThrough) return false;
        }

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
    };

    room.onGameStop = () => {
        resetMatchState();
    };

    (room as any).onTeamVictory = (scores: any) => {
        const winner = scores.red > scores.blue ? 1 : 2;
        handleGameEnd(room, winner);
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
                        const kickPower = 6;
                        const velX = (dx / dist) * kickPower;
                        const velY = (dy / dist) * kickPower;
                        room.setDiscProperties(0, { invMass: mass, xspeed: velX, yspeed: velY });
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

    let tickCounter = 0;

    room.onGameTick = () => {
        handlePhysicsLogic(room);
        watchAFK(room);
        detectRicochet(room);
        checkRules(room);
        enforceDistance(room);
        checkDraftTimeout(room);

        tickCounter++;
        if (tickCounter >= 60) {
            tickCounter = 0;
            GameManager.enforceGameIntegrity(room);
            GameManager.checkAutoBalance(room);
        }

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