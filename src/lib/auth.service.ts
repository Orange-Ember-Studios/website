import { getDbClient, type TursoCredentials } from "./db.ts";
import { verifyPassword, createToken, hashPassword } from "./auth.ts";

export async function loginUser(
  username: string,
  passwordPlain: string,
  creds?: TursoCredentials,
  jwtSecret?: string,
) {
  const db = getDbClient(creds);
  const res = await db.execute({
    sql: 'SELECT id, password_hash FROM users WHERE username = ?',
    args: [username]
  });

  if (res.rows.length === 0) return null;
  const user = res.rows[0];

  const isValid = await verifyPassword(passwordPlain, user.password_hash as string);
  if (!isValid) return null;

  const token = await createToken(
    { userId: user.id as string, username },
    jwtSecret,
  );
  return { token, userId: user.id as string, username };
}

export async function updatePassword(
  userId: string,
  currentPasswordPlain: string,
  newPasswordPlain: string,
  creds?: TursoCredentials,
) {
  const db = getDbClient(creds);
  const res = await db.execute({
    sql: 'SELECT password_hash FROM users WHERE id = ?',
    args: [userId]
  });

  if (res.rows.length === 0) return { error: 'User not found' };
  const user = res.rows[0];

  const isValid = await verifyPassword(currentPasswordPlain, user.password_hash as string);
  if (!isValid) return { error: 'Incorrect current password' };

  const newHash = await hashPassword(newPasswordPlain);
  await db.execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [newHash, userId]
  });

  return { success: true };
}
