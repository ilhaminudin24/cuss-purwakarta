import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Disable caching

export async function GET() {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: "about",
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "About page content not found" },
        { status: 404 }
      );
    }

    // Add cache control headers
    const response = NextResponse.json(page);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error("[ABOUT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 