import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parsePagination } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const stateCode = searchParams.get("state");

  if (!stateCode) return apiError("Query param 'state' is required. Example: ?state=10", 400);

  const { page, limit, skip } = parsePagination(searchParams);

  try {
    const [districts, total] = await db.$transaction([
      db.district.findMany({
        where: { stateCode },
        orderBy: { name: "asc" },
        skip,
        take: limit,
        select: {
          code: true,
          name: true,
          stateCode: true,
          state: { select: { name: true } },
          _count: { select: { subdistricts: true, villages: true } },
        },
      }),
      db.district.count({ where: { stateCode } }),
    ]);

    if (total === 0) return apiError(`No districts found for state code '${stateCode}'`, 404);

    const formatted = districts.map((d) => ({
      code: d.code,
      name: d.name,
      stateCode: d.stateCode,
      stateName: d.state.name,
      subdistrictCount: d._count.subdistricts,
      villageCount: d._count.villages,
    }));

    return apiSuccess(formatted, {
      total, page, limit, pages: Math.ceil(total / limit),
      responseTime: `${Date.now() - start}ms`,
    });
  } catch (err) {
    console.error("[/api/v1/districts]", err);
    return apiError("Failed to fetch districts", 500);
  }
}