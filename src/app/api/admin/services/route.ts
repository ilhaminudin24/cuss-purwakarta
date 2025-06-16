import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CreateData {
  title: string;
  description: string;
  icon: string;
  position?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, icon, position } = body;

    if (!title || !description || !icon) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position value
    const lastService = await prisma.service.findFirst({
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = position ?? (lastService ? lastService.position + 1 : 0);

    const createData: CreateData = {
      title,
      description,
      icon,
      position: newPosition,
    };

    const service = await prisma.service.create({
      data: createData,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 