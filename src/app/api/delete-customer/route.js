import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.existingCustomers.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete Customer:", error);
    return NextResponse.json(
      { error: "Failed to delete Customer", details: error.message },
      { status: 500 }
    );
  }
}