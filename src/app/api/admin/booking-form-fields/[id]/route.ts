import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const field = await prisma.bookingFormField.findUnique({ where: { id: params.id } });
  if (!field) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(field);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { label, name, type, required, options, isActive, position } = await req.json();
  if (!label || !name || !type) {
    return NextResponse.json({ error: "label, name, and type are required." }, { status: 400 });
  }
  const field = await prisma.bookingFormField.update({
    where: { id: params.id },
    data: { label, name, type, required: !!required, options: options ?? null, isActive, position },
  });
  return NextResponse.json(field);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.bookingFormField.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 