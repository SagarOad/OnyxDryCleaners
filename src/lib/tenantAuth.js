import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function getTenantContext() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return {
    userId: user.id,
    role: user.role || "business_admin",
    businessId: user.businessId || null,
    username: user.username || null,
    isSuperAdmin: user.role === "superadmin",
  };
}

export function requireBusiness(ctx) {
  if (!ctx?.businessId) {
    return NextResponse.json({ error: "Business context required" }, { status: 403 });
  }
  return null;
}

export function requireSuperAdmin(ctx) {
  if (!ctx?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

