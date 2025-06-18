import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contents = await prisma.aboutContent.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("[ABOUT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const aboutContent = await prisma.aboutContent.create({
      data: {
        title,
        content,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(aboutContent);
  } catch (error) {
    console.error("[ABOUT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 