import * as argon2 from 'argon2';
import { RoomObject, PlayerObject } from '../types';

export const handleAdminLogin = async (player: PlayerObject, room: RoomObject, args: string[]): Promise<void> => {
  const inputPassword = args[1];
  const storedHash = process.env.HAXBALL_ADMIN_PASSWORD;

  if (!storedHash) {
    console.error('ERROR: ADMIN_PASSWORD_HASH is not set in .env!');

    room.sendChat('System Error: Auth service unavailable.', player.id);
    return;
  }

  if (!inputPassword) {
    room.sendChat('Usage: !admin <password>', player.id);
    return;
  }

  try {
    const isValid = await argon2.verify(storedHash, inputPassword);

    if (isValid) {
      room.setPlayerAdmin(player.id, true);
      room.sendChat('✅ Administrator access granted.', player.id);
      console.log(`[AUTH] ${player.name} (ID: ${player.id}) logged in as Admin via Argon2.`);
    } else {
      room.sendChat('❌ Access denied.', player.id);
      console.log(`[AUTH] ${player.name} (ID: ${player.id}) failed login attempt.`);
    }
  } catch (err) {
    console.error('Argon2 Verification Error:', err);
    room.sendChat('❌ Internal Security Error', player.id);
  }
};