// src/app/api/v1/search/route.ts
// GET /api/v1/search?q=mumbai&type=village&limit=10
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "all"; // all | state | district | subdistrict | village
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  if (!q || q.length < 2) {
    return apiError("Query param 'q' is required and must be at least 2 characters.", 400);
  }

  const results: Record<string, unknown[]> = {};

  try {
    if (type === "all" || type === "state") {
      const states = await db.state.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: limit,
        select: { code: true, name: true },
      });
      results.states = states.map((s) => ({ ...s, type: "state" }));
    }

    if (type === "all" || type === "district") {
      const districts = await db.district.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: limit,
        select: { code: true, name: true, stateCode: true, state: { select: { name: true } } },
      });
      results.districts = districts.map((d) => ({
        code: d.code, name: d.name, stateCode: d.stateCode, stateName: d.state.name, type: "district",
      }));
    }

    if (type === "all" || type === "village") {
      const villages = await db.village.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: limit,
        select: {
          code: true, name: true,
          subdistrictCode: true, districtCode: true, stateCode: true,
          subdistrict: { select: { name: true } },
          district: { select: { name: true } },
          state: { select: { name: true } },
        },
      });
      results.villages = villages.map((v) => ({
        code: v.code,
        name: v.name,
        label: `${v.name}, ${v.subdistrict.name}, ${v.district.name}, ${v.state.name}, India`,
        subdistrictCode: v.subdistrictCode,
        districtCode: v.districtCode,
        stateCode: v.stateCode,
        type: "village",
      }));
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return apiSuccess(results, {
      query: q,
      totalResults,
      responseTime: `${Date.now() - start}ms`,
    });
  } catch (err) {
    console.error("[/api/v1/search]", err);
    return apiError("Search failed.", 500);
  }
}