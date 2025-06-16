import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface UpdateData {
  title?: string;
  description?: string;
  icon?: string;
  position?: number;
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

    const service = await prisma.service.delete({
      where: {
        id: params.id,
      },
    });

    // Update positions of remaining services
    const remainingServices = await prisma.service.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Update positions sequentially
    for (let i = 0; i < remainingServices.length; i++) {
      await prisma.service.update({
        where: { id: remainingServices[i].id },
        data: {
          position: i,
        },
      });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

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
    const { title, description, icon, position } = body;

    const updateData: UpdateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (typeof position === 'number') updateData.position = position;

    const service = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 