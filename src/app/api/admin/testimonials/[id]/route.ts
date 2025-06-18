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
    const { name, role, content, isActive, position } = data;

    const testimonial = await prisma.testimonial.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        role,
        content,
        isActive,
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
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

    // Get the testimonial to be deleted
    const testimonialToDelete = await prisma.testimonial.findUnique({
      where: {
        id: params.id,
      },
      select: {
        position: true,
      },
    });

    if (!testimonialToDelete) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Delete the testimonial
    await prisma.testimonial.delete({
      where: {
        id: params.id,
      },
    });

    // Update positions of remaining testimonials
    await prisma.testimonial.updateMany({
      where: {
        position: {
          gt: testimonialToDelete.position,
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
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
} 