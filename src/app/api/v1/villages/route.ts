import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parsePagination } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const subdistrictCode = searchParams.get("subdistrict");
  const districtCode = searchParams.get("district");

  if (!subdistrictCode || !districtCode) return apiError("Both 'subdistrict' and 'district' query params required.", 400);

  const { page, limit, skip } = parsePagination(searchParams);

  try {
    const [villages, total] = await db.$transaction([
      db.village.findMany({
        where: { subdistrictCode, districtCode },
        orderBy: { name: "asc" },
        skip, take: limit,
        select: {
          code: true, name: true, subdistrictCode: true, districtCode: true, stateCode: true,
          subdistrict: { select: { name: true } },
          district: { select: { name: true } },
          state: { select: { name: true } },
        },
      }),
      db.village.count({ where: { subdistrictCode, districtCode } }),
    ]);

    if (total === 0) return apiError("No villages found for the given sub-district.", 404);

    const formatted = villages.map((v) => ({
      code: v.code, name: v.name,
      label: `${v.name}, ${v.subdistrict.name}, ${v.district.name}, ${v.state.name}, India`,
      subdistrictCode: v.subdistrictCode, subdistrictName: v.subdistrict.name,
      districtCode: v.districtCode, districtName: v.district.name,
      stateCode: v.stateCode, stateName: v.state.name, country: "India",
    }));

    return apiSuccess(formatted, {
      total, page, limit, pages: Math.ceil(total / limit),
      responseTime: `${Date.now() - start}ms`,
    });
  } catch (err) {
    console.error("[/api/v1/villages]", err);
    return apiError("Failed to fetch villages", 500);
  }
}