import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Service } from "@prisma/client";

// Function to initialize positions for existing services
async function initializePositions() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (let i = 0; i < services.length; i++) {
    await prisma.service.update({
      where: { id: services[i].id },
      data: {
        position: i,
      },
    });
  }
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
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
    const { title, description, icon, position } = body;

    if (!title || !description || !icon) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position
    const lastService = await prisma.service.findFirst({
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = typeof position === 'number' ? position : (lastService?.position ?? -1) + 1;

    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon,
        position: newPosition,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 