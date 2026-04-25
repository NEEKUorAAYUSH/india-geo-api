import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { createJWT, apiSuccess, apiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, company } = body;

    if (!email || !password || !name) {
      return apiError("email, password, and name are required.", 400);
    }
    if (password.length < 8) {
      return apiError("Password must be at least 8 characters.", 400);
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("An account with this email already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { email, password: hashedPassword, name, company: company || null },
    });

    // Auto-generate a default API key for the new user
    const apiKey = await db.apiKey.create({
      data: {
        key: `igapi_${uuidv4().replace(/-/g, "")}`,
        secret: await bcrypt.hash(uuidv4(), 10),
        name: "Default Key",
        userId: user.id,
      },
    });

    const token = await createJWT({ userId: user.id, email: user.email, role: user.role, plan: user.plan });

    return apiSuccess(
      {
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
        token,
        apiKey: apiKey.key,
      },
      { message: "Registration successful" }
    );
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return apiError("Registration failed. Please try again.", 500);
  }
}