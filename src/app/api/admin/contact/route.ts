import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let page = await prisma.page.findUnique({
      where: { slug: "contact" }
    });

    if (!page) {
      // Create default content if it doesn't exist
      page = await prisma.page.create({
        data: {
          slug: "contact",
          title: "Kontak Kami",
          content: "WhatsApp: 0878-5886-0846\nTelepon: 0878-5886-0846\nInstagram: @cuss.purwakarta"
        }
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("[CONTACT_GET] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ error: "Title and content are required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug: "contact",
        title,
        content
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[CONTACT_POST] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ error: "Title and content are required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const page = await prisma.page.update({
      where: { slug: "contact" },
      data: {
        title,
        content
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[CONTACT_PUT] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 