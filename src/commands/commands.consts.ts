export const ChatCommands = Object.freeze({
  ADMIN: '!admin',
  HELP: '!help',
  START: '!start',
  STOP: '!stop',
  STATS: '!stats',
});

export type ChatCommands = typeof ChatCommands[keyof typeof ChatCommands];
