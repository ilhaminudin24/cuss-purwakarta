import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const steps = await prisma.orderStep.findMany({
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("Error fetching order steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch order steps" },
      { status: 500 }
    );
  }
} 