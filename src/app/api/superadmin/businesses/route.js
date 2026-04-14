import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../lib/prisma";
import { getTenantContext, requireSuperAdmin } from "@/lib/tenantAuth";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET() {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const forbidden = requireSuperAdmin(ctx);
    if (forbidden) return forbidden;

    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: { id: true, username: true, role: true, isActive: true },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            orders: true,
            customers: true,
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("superadmin businesses GET error:", error);
    return NextResponse.json(
      { error: "Failed to load businesses", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ctx = await getTenantContext();
    if (ctx.error) return ctx.error;
    const forbidden = requireSuperAdmin(ctx);
    if (forbidden) return forbidden;

    const body = await request.json();
    const {
      businessName,
      slug,
      ownerUsername,
      ownerPassword,
      ownerEmail,
      monthlyAmount,
      notes,
    } = body || {};

    if (!businessName || !ownerUsername || !ownerPassword) {
      return NextResponse.json(
        { error: "businessName, ownerUsername and ownerPassword are required" },
        { status: 400 }
      );
    }
    if (String(ownerPassword).length < 8) {
      return NextResponse.json(
        { error: "Owner password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const cleanedSlug = slugify(slug || businessName);
    if (!cleanedSlug) {
      return NextResponse.json(
        { error: "Could not create a valid slug for business" },
        { status: 400 }
      );
    }

    const hash = bcrypt.hashSync(String(ownerPassword), 10);
    const amount = Number(monthlyAmount);
    const safeAmount = Number.isFinite(amount) && amount >= 0 ? amount : 0;
    const now = new Date();
    const nextDueDate = new Date(now);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const created = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: String(businessName).trim(),
          slug: cleanedSlug,
          monthlyPayment: safeAmount,
          paymentStatus: "unpaid",
          paymentDueDay: 1,
          notes: notes || null,
        },
      });
      const user = await tx.businessUser.create({
        data: {
          businessId: business.id,
          username: String(ownerUsername).trim(),
          password: hash,
          email: ownerEmail ? String(ownerEmail).trim() : null,
          role: "business_admin",
          isActive: true,
        },
      });
      const subscription = await tx.subscription.create({
        data: {
          businessId: business.id,
          monthlyAmount: safeAmount,
          paymentStatus: "unpaid",
          nextDueDate,
          notes: notes || null,
        },
      });
      return { business, user, subscription };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("superadmin businesses POST error:", error);
    return NextResponse.json(
      { error: "Failed to create business", details: error.message },
      { status: 500 }
    );
  }
}

