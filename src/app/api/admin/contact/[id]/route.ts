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
    const { type, value, isActive, position } = body;

    if (!type || !value) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const contact = await prisma.contactInfo.update({
      where: {
        id: params.id,
      },
      data: {
        type,
        value,
        isActive,
        position,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_PUT]", error);
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

    const contact = await prisma.contactInfo.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 