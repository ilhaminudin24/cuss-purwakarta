import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

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