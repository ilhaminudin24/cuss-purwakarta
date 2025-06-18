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
    const { title, content, isActive } = body;

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const aboutContent = await prisma.aboutContent.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        content,
        isActive,
      },
    });

    return NextResponse.json(aboutContent);
  } catch (error) {
    console.error("[ABOUT_PUT]", error);
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

    const aboutContent = await prisma.aboutContent.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(aboutContent);
  } catch (error) {
    console.error("[ABOUT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 