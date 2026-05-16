import { SignJWT, jwtVerify } from "jose";
import { EnvManager } from "./EnvManager.ts";

function getSecret(secretOverride?: string) {
  return new TextEncoder().encode(secretOverride ?? EnvManager.JWT_SECRET);
}

export async function createToken(
  payload: { userId: string; username: string },
  secretOverride?: string,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret(secretOverride));
}

export async function verifyToken(token: string, secretOverride?: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret(secretOverride));
    return payload as { userId: string; username: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const pbkdf2 = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    pbkdf2,
    256,
  );

  const saltStr = btoa(String.fromCharCode(...salt));
  const hashStr = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

  return `${saltStr}.${hashStr}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  try {
    const [saltStr, hashStr] = storedHash.split(".");
    if (!saltStr || !hashStr) return false;

    const salt = new Uint8Array(
      atob(saltStr)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    const pbkdf2 = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      pbkdf2,
      256,
    );

    const currentHashStr = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
    return currentHashStr === hashStr;
  } catch {
    return false;
  }
}
