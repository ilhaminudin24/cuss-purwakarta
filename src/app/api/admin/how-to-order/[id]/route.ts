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
    const { title, description, icon, isActive, position } = body;

    if (!title || !description || !icon) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const step = await prisma.orderStep.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        icon,
        isActive,
        position,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[HOW_TO_ORDER_PUT]", error);
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

    const step = await prisma.orderStep.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("[HOW_TO_ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 