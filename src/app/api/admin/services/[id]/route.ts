import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

    // Reorder remaining services
    const remainingServices = await prisma.service.findMany({
      orderBy: {
        position: 'asc',
      },
    });

    // Update positions sequentially
    for (let i = 0; i < remainingServices.length; i++) {
      await prisma.service.update({
        where: { id: remainingServices[i].id },
        data: { position: i },
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
    const { icon, title, description, position } = body;

    if (!icon || !title || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // If position is being updated, we need to handle the reordering
    if (typeof position === 'number') {
      const currentService = await prisma.service.findUnique({
        where: { id: params.id },
      });

      if (!currentService) {
        return new NextResponse("Service not found", { status: 404 });
      }

      // If moving up (position decreasing)
      if (position < currentService.position) {
        await prisma.service.updateMany({
          where: {
            position: {
              gte: position,
              lt: currentService.position,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      }
      // If moving down (position increasing)
      else if (position > currentService.position) {
        await prisma.service.updateMany({
          where: {
            position: {
              gt: currentService.position,
              lte: position,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      }
    }

    const service = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: {
        icon,
        title,
        description,
        ...(typeof position === 'number' && { position }),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 