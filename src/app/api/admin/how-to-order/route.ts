import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const steps = await prisma.orderStep.findMany({
      orderBy: { position: "asc" },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("[HOW_TO_ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, icon, isActive } = body;

    if (!title || !description || !icon) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position
    const lastStep = await prisma.orderStep.findFirst({
      orderBy: { position: "desc" },
    });
    const position = lastStep ? lastStep.position + 1 : 0;

    const step = await prisma.orderStep.create({
      data: {
        title,
        description,
        icon,
        position,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[HOW_TO_ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 