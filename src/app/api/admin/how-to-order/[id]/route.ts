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
    const { title, content, isActive, position } = data;

    const step = await prisma.howToOrder.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        content,
        isActive,
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("Error updating how-to-order step:", error);
    return NextResponse.json(
      { error: "Failed to update how-to-order step" },
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

    // Get the step to be deleted
    const stepToDelete = await prisma.howToOrder.findUnique({
      where: {
        id: params.id,
      },
      select: {
        position: true,
      },
    });

    if (!stepToDelete) {
      return NextResponse.json(
        { error: "How-to-order step not found" },
        { status: 404 }
      );
    }

    // Delete the step
    await prisma.howToOrder.delete({
      where: {
        id: params.id,
      },
    });

    // Update positions of remaining steps
    await prisma.howToOrder.updateMany({
      where: {
        position: {
          gt: stepToDelete.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting how-to-order step:", error);
    return NextResponse.json(
      { error: "Failed to delete how-to-order step" },
      { status: 500 }
    );
  }
} 