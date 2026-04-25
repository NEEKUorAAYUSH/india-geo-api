// src/app/api/v1/states/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest, apiSuccess, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Normally we check auth, but let's bypass it just for this quick test to ensure the DB works
  const auth = await authenticateRequest(req);
  if (!auth.ok) return apiError(auth.error, auth.status);

  try {
    const states = await db.state.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
        _count: {
          select: { districts: true, villages: true },
        },
      },
    });

    const formatted = states.map((s) => ({
      code: s.code,
      name: s.name,
      districtCount: s._count.districts,
      villageCount: s._count.villages,
    }));

    return apiSuccess(formatted, {
      total: formatted.length,
      responseTime: `${Date.now() - start}ms`,
    });
  } catch (err) {
    console.error("[/api/v1/states]", err);
    return apiError("Failed to fetch states", 500);
  }
}