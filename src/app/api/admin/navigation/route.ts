import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    // Log the start of the request
    console.log("[NAVIGATION_GET] Starting request");

    const session = await getServerSession(authOptions);
    console.log("[NAVIGATION_GET] Session check:", session ? "Authenticated" : "Unauthenticated");

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test database connection
    await prisma.$connect();
    console.log("[NAVIGATION_GET] Database connection successful");

    const menuItems = await prisma.navigationMenu.findMany({
      where: { 
        menuType: "admin",
        isVisible: true 
      },
      orderBy: { order: "asc" },
    });

    console.log("[NAVIGATION_GET] Successfully fetched menu items:", menuItems.length);

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("[NAVIGATION_GET] Error details:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[NAVIGATION_GET] Prisma known error:", {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
      return new NextResponse(
        JSON.stringify({ 
          error: "Database error",
          code: error.code,
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error("[NAVIGATION_GET] Prisma initialization error:", {
        message: error.message,
        errorCode: error.errorCode,
      });
      return new NextResponse(
        JSON.stringify({ 
          error: "Database initialization error",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log("[NAVIGATION_GET] Database disconnected successfully");
    } catch (error) {
      console.error("[NAVIGATION_GET] Error disconnecting from database:", error);
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, path, order, isVisible, menuType } = body;

    if (!title || !path || !menuType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const menuItem = await prisma.navigationMenu.create({
      data: {
        title,
        path,
        order: order || 0,
        isVisible: isVisible ?? true,
        menuType,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[NAVIGATION_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 