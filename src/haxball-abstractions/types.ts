import { FontStyle } from '../utils/font.types';

export type TeamID = 0 | 1 | 2; // 0: Spectator, 1: Red, 2: Blue

export type PlayerObject = {
  id: number;
  name: string;
  team: TeamID;
  admin: boolean;
  position: { x: number, y: number } | null;
  auth: string;
  conn: string;
};

export type DiscPropertiesObject = {
  x: number;
  y: number;
  xspeed: number;
  yspeed: number;
  xgravity: number;
  ygravity: number;
  radius: number;
  bCoef: number;
  invMass: number;
  damping: number;
  color: number;
  cMask: number;
  cGroup: number;
};

export type RoomConfig = {
  roomName: string;
  playerName?: string;
  password?: string;
  maxPlayers: number;
  public?: boolean;
  geo?: { code: string, lat: number, lon: number };
  token: string;
  noPlayer?: boolean;
};

export type RoomObject = {
  sendAnnouncement(
    msg: string,
    targetId?: number | null,
    color?: number,
    style?: FontStyle,
    sound?: 0 | 1 | 2,
  ): void;

  sendChat(message: string, playerId?: number): void;
  setPlayerAdmin(playerId: number, admin: boolean): void;
  startGame(): void;
  stopGame(): void;
  pauseGame(pause: boolean): void;
  setDefaultStadium(stadiumName: string): void;
  setCustomStadium(stadiumFileContents: string): void;

  getPlayerList(): PlayerObject[];
  getPlayer(playerId: number): PlayerObject | null;
  getDiscProperties(discIndex: number): DiscPropertiesObject;
  setDiscProperties(discIndex: number, properties: Partial<DiscPropertiesObject>): void;
  getPlayerDiscProperties(playerId: number): DiscPropertiesObject;
  setPlayerDiscProperties(playerId: number, properties: Partial<DiscPropertiesObject>): void;
  setPlayerAvatar(playerId: number, avatar: string | null): void;

  onGameTick?: () => void;

  onPlayerJoin?: (player: PlayerObject) => void;
  onPlayerLeave?: (player: PlayerObject) => void;
  onPlayerChat?: (player: PlayerObject, message: string) => boolean;
  onGameStart?: (byPlayer: PlayerObject | null) => void;
  onGameStop?: (byPlayer: PlayerObject | null) => void;
  onRoomLink?: (link: string) => void;
  onPlayerBallKick?: (player: PlayerObject) => void;
  onTeamGoal?: (team: TeamID) => void;
};

export type HBInitFunction = (config: RoomConfig) => RoomObject;