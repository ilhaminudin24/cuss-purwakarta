import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, path, order, isVisible } = body;

    if (!title || !path) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const menuItem = await prisma.navigationMenu.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        path,
        order,
        isVisible,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[NAVIGATION_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const menuItem = await prisma.navigationMenu.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[NAVIGATION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 