import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.bookingFormField.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  const { label, name, type, required, readonly, options, isActive, autoCalculate } = await req.json();
  if (!label || !name || !type) {
    return NextResponse.json({ error: "label, name, and type are required." }, { status: 400 });
  }
  const last = await prisma.bookingFormField.findFirst({ orderBy: { position: "desc" } });
  const position = last ? last.position + 1 : 1;
  const field = await prisma.bookingFormField.create({
    data: {
      label,
      name,
      type,
      required: !!required,
      readonly: !!readonly,
      options: options ?? null,
      isActive: isActive ?? true,
      position,
      autoCalculate: autoCalculate ?? null,
    },
  });
  return NextResponse.json(field);
} 