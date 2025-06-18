import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const defaultMenuItems = [
  { title: "Beranda", path: "/", order: 1, isVisible: true, menuType: "website" },
  { title: "Layanan", path: "/services", order: 2, isVisible: true, menuType: "website" },
  { title: "Cara Pesan", path: "/how-to-order", order: 3, isVisible: true, menuType: "website" },
  { title: "Testimoni", path: "/testimonials", order: 4, isVisible: true, menuType: "website" },
  { title: "FAQ", path: "/faq", order: 5, isVisible: true, menuType: "website" },
  { title: "Tentang", path: "/about", order: 6, isVisible: true, menuType: "website" },
  { title: "Kontak", path: "/contact", order: 7, isVisible: true, menuType: "website" },
];

const adminMenuItems = [
  { title: "Services", path: "/admin/services", order: 1, isVisible: true, menuType: "admin" },
  { title: "FAQs", path: "/admin/faqs", order: 2, isVisible: true, menuType: "admin" },
  { title: "Navigation", path: "/admin/navigation", order: 3, isVisible: true, menuType: "admin" },
  { title: "Users", path: "/admin/users", order: 4, isVisible: true, menuType: "admin" },
  { title: "Booking-Form", path: "/admin/booking-form", order: 5, isVisible: true, menuType: "admin" },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete existing menu items
    await prisma.navigationMenu.deleteMany({});

    // Create default and admin menu items
    const createdItems = await Promise.all([
      ...defaultMenuItems.map((item) =>
        prisma.navigationMenu.create({
          data: item,
        })
      ),
      ...adminMenuItems.map((item) =>
        prisma.navigationMenu.create({
          data: item,
        })
      ),
    ]);

    return NextResponse.json(createdItems);
  } catch (error) {
    console.error("[NAVIGATION_INIT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 