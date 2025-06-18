import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("SESSION:", session);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const menuItems = await prisma.navigationMenu.findMany({
      where: { menuType: "admin" },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("[NAVIGATION_GET]", error);
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
    const { title, path, order, isVisible, menuType } = body;

    if (!title || !path || !menuType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const menuItem = await prisma.navigationMenu.create({
      data: {
        title,
        path,
        order: order || 0,
        isVisible: isVisible ?? true,
        menuType,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[NAVIGATION_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 