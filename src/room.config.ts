import 'dotenv/config';

export const HAXOS_CONFIG = {
  token: process.env.HAXBALL_TOKEN as string,
  roomName: 'Real Soccer 7v7 [HaxOS v0.1]',
  maxPlayers: 14,
  public: true,
  noPlayer: true,
  geo: {code: 'UA', lat: 50.45, lon: 30.52}
};