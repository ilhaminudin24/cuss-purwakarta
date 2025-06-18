'use server'

import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { authOptions } from "./auth";

const adminMenuItems = [
  { title: "Dashboard", path: "/admin", order: 1, isVisible: true, menuType: "admin" },
  { title: "Layanan", path: "/admin/services", order: 2, isVisible: true, menuType: "admin" },
  { title: "FAQ", path: "/admin/faqs", order: 3, isVisible: true, menuType: "admin" },
  { title: "Menu", path: "/admin/navigation", order: 4, isVisible: true, menuType: "admin" },
  { title: "Pengguna", path: "/admin/users", order: 5, isVisible: true, menuType: "admin" },
  { title: "Form Pemesanan", path: "/admin/booking-form", order: 6, isVisible: true, menuType: "admin" },
];

export async function getAdminNavigation() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Fetch all menu items
    const menuItems = await prisma.navigationMenu.findMany({
      where: {
        menuType: "admin",
        isVisible: true,
      },
      orderBy: {
        order: 'asc'
      }
    });

    // If no menu items exist, initialize with default admin items
    if (menuItems.length === 0) {
      const createdItems = await Promise.all(
        adminMenuItems.map((item) =>
          prisma.navigationMenu.create({
            data: item,
          })
        )
      );
      return createdItems;
    }

    return menuItems;
  } catch (error) {
    console.error("[NAVIGATION_GET]", error);
    throw error;
  }
} 