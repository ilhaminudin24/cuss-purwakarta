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

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { position: "asc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("[TESTIMONIALS_GET]", error);
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
    const { name, role, content, isActive } = body;

    if (!name || !role || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position
    const lastTestimonial = await prisma.testimonial.findFirst({
      orderBy: { position: "desc" },
    });
    const position = lastTestimonial ? lastTestimonial.position + 1 : 0;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        content,
        position,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("[TESTIMONIALS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 