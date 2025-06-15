import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("[FAQS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 