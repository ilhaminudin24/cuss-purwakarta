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

    const faqs = await prisma.fAQ.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("[FAQS_GET]", error);
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
    const { question, answer } = body;

    if (!question || !answer) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("[FAQS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 