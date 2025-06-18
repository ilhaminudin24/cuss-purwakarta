import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, icon, isActive, position } = data;

    const step = await prisma.orderStep.update({
      where: { id: params.id },
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
    console.error("Error updating order step:", error);
    return NextResponse.json(
      { error: "Failed to update order step" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.orderStep.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Order step deleted successfully" });
  } catch (error) {
    console.error("Error deleting order step:", error);
    return NextResponse.json(
      { error: "Failed to delete order step" },
      { status: 500 }
    );
  }
} 