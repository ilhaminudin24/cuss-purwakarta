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

    const contacts = await prisma.contactInfo.findMany({
      orderBy: { position: "asc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACT_GET]", error);
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
    const { type, value, isActive } = body;

    if (!type || !value) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the highest position
    const lastContact = await prisma.contactInfo.findFirst({
      orderBy: { position: "desc" },
    });
    const position = lastContact ? lastContact.position + 1 : 0;

    const contact = await prisma.contactInfo.create({
      data: {
        type,
        value,
        position,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 