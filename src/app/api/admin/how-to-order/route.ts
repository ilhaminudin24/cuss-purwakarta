import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, icon, isActive } = data;

    // Get the highest position
    const lastStep = await prisma.orderStep.findFirst({
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastStep ? lastStep.position + 1 : 1;

    const step = await prisma.orderStep.create({
      data: {
        title,
        description,
        icon,
        isActive,
        position: newPosition,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("Error creating order step:", error);
    return NextResponse.json(
      { error: "Failed to create order step" },
      { status: 500 }
    );
  }
} 