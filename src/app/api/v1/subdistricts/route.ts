import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parsePagination } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const districtCode = searchParams.get("district");
  const stateCode = searchParams.get("state");

  if (!districtCode || !stateCode) return apiError("Both 'district' and 'state' query params are required.", 400);

  const { page, limit, skip } = parsePagination(searchParams);

  try {
    const [subdistricts, total] = await db.$transaction([
      db.subdistrict.findMany({
        where: { districtCode, stateCode },
        orderBy: { name: "asc" },
        skip, take: limit,
        select: {
          code: true, name: true, districtCode: true, stateCode: true,
          district: { select: { name: true } },
          state: { select: { name: true } },
          _count: { select: { villages: true } },
        },
      }),
      db.subdistrict.count({ where: { districtCode, stateCode } }),
    ]);

    if (total === 0) return apiError(`No sub-districts found for district '${districtCode}'`, 404);

    const formatted = subdistricts.map((s) => ({
      code: s.code, name: s.name, districtCode: s.districtCode, districtName: s.district.name,
      stateCode: s.stateCode, stateName: s.state.name, villageCount: s._count.villages,
    }));

    return apiSuccess(formatted, {
      total, page, limit, pages: Math.ceil(total / limit),
      responseTime: `${Date.now() - start}ms`,
    });
  } catch (err) {
    console.error("[/api/v1/subdistricts]", err);
    return apiError("Failed to fetch sub-districts", 500);
  }
}