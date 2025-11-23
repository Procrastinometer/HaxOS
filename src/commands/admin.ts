import * as argon2 from 'argon2';
import { CommandHandler } from './types';
import { sendMessage } from '../utils/send-message';
import { COLORS } from '../utils/colors';
import { FontStyle } from '../utils/font.types';
import { PlayerObject, RoomObject } from '../haxball-abstractions/types';

export const handleAdminLogin = async (player: PlayerObject, room: RoomObject, args: string[]): Promise<void> => {
  const inputPassword = args[1];
  const storedHash = process.env.HAXBALL_ADMIN_PASSWORD;

  if (!storedHash) {
    console.error('ERROR: ADMIN_PASSWORD_HASH is not set in .env!');

    sendMessage(room, 'System Error: Auth service unavailable.', player.id, COLORS.ERROR, FontStyle.BOLD);
    return;
  }

  if (!inputPassword) {
    sendMessage(
      room,
      'Usage: !admin <password>',
      player.id,
      COLORS.INFO,
      FontStyle.ITALIC,
    );
    return;
  }

  try {
    const isValid = await argon2.verify(storedHash, inputPassword);

    if (isValid) {
      room.setPlayerAdmin(player.id, true);
      sendMessage(room, 'Administrator access granted.', player.id, COLORS.SUCCESS, FontStyle.BOLD);
      console.log(`[AUTH] ${player.name} (ID: ${player.id}) logged in as Admin via Argon2.`);
    } else {
      sendMessage(room, 'Access denied.', player.id, COLORS.ERROR);
      console.log(`[AUTH] ${player.name} (ID: ${player.id}) failed login attempt.`);
    }
  } catch (err) {
    console.error('Argon2 Verification Error:', err);
    sendMessage(room, 'Internal Security Error', player.id, COLORS.ERROR);
  }
};

export const adminGuard = (handler: CommandHandler): CommandHandler => (player, room, args) => {
  console.log(!player.admin)
  if (!player.admin) {
    sendMessage(room, 'Permission denied. Admin only.', player.id, COLORS.ERROR, FontStyle.BOLD);

    return;
  }

  return handler(player, room, args);
};