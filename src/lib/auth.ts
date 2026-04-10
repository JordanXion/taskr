import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod"
);

export async function createToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  // Try cookies() first, fall back to raw header parsing
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) return verifyToken(token);
  } catch {
    // fall through
  }

  // Fallback: parse from raw Cookie header
  try {
    const hdrs = await headers();
    const cookieHeader = hdrs.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
    if (match?.[1]) return verifyToken(match[1]);
  } catch {
    // fall through
  }

  return null;
}
