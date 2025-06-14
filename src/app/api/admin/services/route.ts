import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
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
    const { icon, title, description } = body;

    if (!icon || !title || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        icon,
        title,
        description,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 