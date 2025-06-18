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

    const steps = await prisma.howToOrder.findMany({
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("Error fetching how-to-order steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch how-to-order steps" },
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
    const { title, content, isActive } = data;

    // Get the highest position
    const highestPosition = await prisma.howToOrder.findFirst({
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    const newPosition = (highestPosition?.position ?? -1) + 1;

    const step = await prisma.howToOrder.create({
      data: {
        title,
        content,
        isActive,
        position: newPosition,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("Error creating how-to-order step:", error);
    return NextResponse.json(
      { error: "Failed to create how-to-order step" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ error: "Title and content are required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const page = await prisma.page.update({
      where: { slug: "how-to-order" },
      data: {
        title,
        content
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[HOW_TO_ORDER_PUT] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 