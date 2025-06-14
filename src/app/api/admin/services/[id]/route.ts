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

    const service = await prisma.service.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 