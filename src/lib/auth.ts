// src/lib/auth.ts
// JWT creation/verification + API key utilities

import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

// ─── RATE LIMITS PER PLAN ────────────────────────────────
export const PLAN_LIMITS = {
  FREE: { daily: 1000, perMinute: 10 },
  PREMIUM: { daily: 50000, perMinute: 100 },
  PRO: { daily: 500000, perMinute: 500 },
  UNLIMITED: { daily: -1, perMinute: -1 }, // no limit
} as const;

// ─── JWT ─────────────────────────────────────────────────

export async function createJWT(payload: {
  userId: number;
  email: string;
  role: string;
  plan: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: number;
      email: string;
      role: string;
      plan: string;
    };
  } catch {
    return null;
  }
}

// ─── AUTH MIDDLEWARE HELPERS ─────────────────────────────

export type AuthResult =
  | { ok: true; userId: number; role: string; plan: string; apiKeyId?: number }
  | { ok: false; error: string; status: number };

/**
 * Validates a request using either:
 *   1. Bearer JWT token (Authorization: Bearer <token>)
 *   2. API key (X-API-Key: <key>)
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");

  // --- JWT Auth ---
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token);
    if (!payload) {
      return { ok: false, error: "Invalid or expired token", status: 401 };
    }
    return {
      ok: true,
      userId: payload.userId,
      role: payload.role,
      plan: payload.plan,
    };
  }

  // --- API Key Auth ---
  if (apiKey) {
    const keyRecord = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord || !keyRecord.isActive || !keyRecord.user.isActive) {
      return { ok: false, error: "Invalid or inactive API key", status: 401 };
    }

    // Update last used timestamp (fire and forget)
    db.apiKey
      .update({ where: { id: keyRecord.id }, data: { lastUsed: new Date() } })
      .catch(console.error);

    return {
      ok: true,
      userId: keyRecord.userId,
      role: keyRecord.user.role,
      plan: keyRecord.user.plan,
      apiKeyId: keyRecord.id,
    };
  }

  return {
    ok: false,
    error: "Authentication required. Provide Bearer token or X-API-Key header.",
    status: 401,
  };
}

// ─── RESPONSE HELPERS ────────────────────────────────────

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return Response.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return Response.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// ─── PAGINATION ──────────────────────────────────────────

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
