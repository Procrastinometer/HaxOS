export type TeamID = 0 | 1 | 2;

export type PlayerObject = {
  id: number;
  name: string;
  team: TeamID;
  admin: boolean;
  position: { x: number, y: number } | null;
  auth: string;
  conn: string;
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
  sendChat(message: string, playerId?: number): void;
  setPlayerAdmin(playerId: number, admin: boolean): void;
  startGame(): void;
  stopGame(): void;

  onPlayerJoin?: (player: PlayerObject) => void;
  onPlayerLeave?: (player: PlayerObject) => void;
  onPlayerChat?: (player: PlayerObject, message: string) => boolean;
  onGameStart?: (byPlayer: PlayerObject | null) => void;
  onGameStop?: (byPlayer: PlayerObject | null) => void;
  onRoomLink?: (link: string) => void;
};

export type HBInitFunction = (config: RoomConfig) => RoomObject;

declare module 'haxball.js' {
  function HBInit(config: RoomConfig): RoomObject;

  const HaxballJS: Promise<typeof HBInit>;
  export = HaxballJS;
}