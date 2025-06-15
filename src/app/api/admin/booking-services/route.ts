import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.bookingService.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const { name, isActive } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  // Find the next position
  const last = await prisma.bookingService.findFirst({ orderBy: { position: "desc" } });
  const position = last ? last.position + 1 : 1;
  const service = await prisma.bookingService.create({
    data: { name, isActive: isActive ?? true, position },
  });
  return NextResponse.json(service);
} 