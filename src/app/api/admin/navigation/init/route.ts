import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const defaultMenuItems = [
  { title: "Beranda", path: "/", order: 1, isVisible: true },
  { title: "Layanan", path: "/services", order: 2, isVisible: true },
  { title: "Cara Pesan", path: "/how-to-order", order: 3, isVisible: true },
  { title: "Testimoni", path: "/testimonials", order: 4, isVisible: true },
  { title: "FAQ", path: "/faq", order: 5, isVisible: true },
  { title: "Tentang", path: "/about", order: 6, isVisible: true },
  { title: "Kontak", path: "/contact", order: 7, isVisible: true },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete existing menu items
    await prisma.navigationMenu.deleteMany({});

    // Create default menu items
    const createdItems = await Promise.all(
      defaultMenuItems.map((item) =>
        prisma.navigationMenu.create({
          data: item,
        })
      )
    );

    return NextResponse.json(createdItems);
  } catch (error) {
    console.error("[NAVIGATION_INIT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 