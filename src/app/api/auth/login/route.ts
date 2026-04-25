import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createJWT, apiSuccess, apiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError("email and password are required.", 400);
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { apiKeys: { where: { isActive: true }, take: 1 } },
    });

    if (!user || !user.isActive) {
      return apiError("Invalid credentials.", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return apiError("Invalid credentials.", 401);
    }

    const token = await createJWT({ userId: user.id, email: user.email, role: user.role, plan: user.plan });

    return apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, company: user.company },
      token,
      apiKey: user.apiKeys[0]?.key || null,
    });
  } catch (err) {
    console.error("[/api/auth/login]", err);
    return apiError("Login failed. Please try again.", 500);
  }
}