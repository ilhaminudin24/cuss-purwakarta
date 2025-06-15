import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menuItems = await prisma.navigationMenu.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("[NAVIGATION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 