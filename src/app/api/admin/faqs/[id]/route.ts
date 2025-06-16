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
    const { question, answer } = body;

    if (!question || !answer) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const faq = await prisma.fAQ.update({
      where: {
        id: params.id,
      },
      data: {
        question,
        answer,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("[FAQ_PUT]", error);
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

    const faq = await prisma.fAQ.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("[FAQ_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 