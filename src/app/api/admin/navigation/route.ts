import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Add retry logic for database operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  timeout: number = 5000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Wrap operation in a timeout promise
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Operation timeout")), timeout)
        )
      ]);
      return result as T;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function GET() {
  try {
    console.log("[NAVIGATION_GET] Starting request");

    const session = await getServerSession(authOptions);
    console.log("[NAVIGATION_GET] Session check:", session ? "Authenticated" : "Unauthenticated");

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test database connection with timeout
    try {
      await retryOperation(
        async () => await prisma.$connect(),
        3, // max retries
        5000 // timeout in ms
      );
      console.log("[NAVIGATION_GET] Database connection successful");
    } catch (error) {
      console.error("[NAVIGATION_GET] Database connection error:", error);
      return new NextResponse(
        JSON.stringify({ 
          error: "Database connection error",
          details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const menuItems = await retryOperation(
      async () => prisma.navigationMenu.findMany({
        where: { 
          menuType: "admin",
          isVisible: true 
        },
        orderBy: { order: "asc" },
      }),
      3, // max retries
      5000 // timeout in ms
    );

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
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { title, path, order, isVisible, menuType } = body;

    if (!title || !path || !menuType) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const menuItem = await retryOperation(
      async () => prisma.navigationMenu.create({
        data: {
          title,
          path,
          order: order || 0,
          isVisible: isVisible ?? true,
          menuType,
        },
      }),
      3, // max retries
      5000 // timeout in ms
    );

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[NAVIGATION_POST] Error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Database error",
          code: error.code,
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
    } catch (error) {
      console.error("[NAVIGATION_POST] Error disconnecting from database:", error);
    }
  }
} 