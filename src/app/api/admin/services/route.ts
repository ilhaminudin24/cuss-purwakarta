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

  // Update positions sequentially
  for (let i = 0; i < services.length; i++) {
    await prisma.service.update({
      where: { id: services[i].id },
      data: { position: i },
    });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if any service has null or undefined position
    const services = await prisma.service.findMany();
    const needsInitialization = services.some(service => service.position === null || service.position === undefined);
    
    if (needsInitialization) {
      await initializePositions();
    }

    const orderedServices = await prisma.service.findMany({
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(orderedServices);
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
    const { icon, title, description } = body;

    if (!icon || !title || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position
    const lastService = await prisma.service.findFirst({
      orderBy: {
        position: 'desc',
      },
    });

    const position = lastService ? lastService.position + 1 : 0;

    const service = await prisma.service.create({
      data: {
        icon,
        title,
        description,
        position,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 