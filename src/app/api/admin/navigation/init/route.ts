import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

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
  { title: "Dashboard", path: "/admin", order: 1, isVisible: true, menuType: "admin" },
  { title: "Layanan", path: "/admin/services", order: 2, isVisible: true, menuType: "admin" },
  { title: "FAQ", path: "/admin/faqs", order: 3, isVisible: true, menuType: "admin" },
  { title: "Menu", path: "/admin/navigation", order: 4, isVisible: true, menuType: "admin" },
  { title: "Pengguna", path: "/admin/users", order: 5, isVisible: true, menuType: "admin" },
  { title: "Form Pemesanan", path: "/admin/booking-form", order: 6, isVisible: true, menuType: "admin" },
  { title: "Cara Pesan", path: "/admin/how-to-order", order: 7, isVisible: true, menuType: "admin" },
  { title: "Testimoni", path: "/admin/testimonials", order: 8, isVisible: true, menuType: "admin" },
  { title: "Tentang", path: "/admin/about", order: 9, isVisible: true, menuType: "admin" },
  { title: "Kontak", path: "/admin/contact", order: 10, isVisible: true, menuType: "admin" },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all admin menu items
    const menuItems = await prisma.navigationMenu.findMany({
      where: {
        menuType: "admin",
        isVisible: true,
      },
      orderBy: {
        order: "asc",
      },
      distinct: ['id'], // Ensure no duplicates
    });

    const response = NextResponse.json(menuItems);
    
    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error("Error fetching admin navigation:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation" },
      { status: 500 }
    );
  }
} 