import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { email: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists." }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(user);
} 