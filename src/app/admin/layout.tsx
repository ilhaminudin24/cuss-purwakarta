"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminNavigation from "../components/AdminNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (pathname !== "/admin/login" && status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Allow access to login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Prevent flash of unauthorized content
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 overflow-y-auto z-50">
        <AdminNavigation />
      </div>
      <div className="ml-64">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 