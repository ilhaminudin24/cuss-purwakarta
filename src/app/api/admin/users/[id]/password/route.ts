import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { password } = await req.json();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: params.id },
    data: { password: hashed },
  });
  return NextResponse.json({ success: true });
} 