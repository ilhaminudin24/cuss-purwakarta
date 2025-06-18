"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

interface NavigationMenu {
  id: string;
  title: string;
  path?: string | null;
  icon?: string | null;
  order: number;
  isVisible: boolean;
  menuType: string;
  parentId?: string | null;
  children?: NavigationMenu[];
}

export default function AdminNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/admin/navigation/init", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) throw new Error("Failed to fetch navigation");
        const data = await response.json();

        if (!mounted) return;

        // Create a Set to track unique IDs
        const seenIds = new Set<string>();
        const uniqueData = data.filter((item: NavigationMenu) => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

        // Organize items into a hierarchy
        const parentItems: NavigationMenu[] = [];
        const childrenMap = new Map<string, NavigationMenu[]>();

        uniqueData.forEach((item: NavigationMenu) => {
          if (!item.parentId) {
            parentItems.push(item);
          } else {
            if (!childrenMap.has(item.parentId)) {
              childrenMap.set(item.parentId, []);
            }
            childrenMap.get(item.parentId)?.push(item);
          }
        });

        // Sort parent items by order
        parentItems.sort((a, b) => a.order - b.order);

        // Add sorted children to their parents
        parentItems.forEach((parent) => {
          const children = childrenMap.get(parent.id);
          if (children) {
            children.sort((a, b) => a.order - b.order);
            parent.children = children;
          }
        });

        setMenuItems(parentItems);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch navigation");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMenuItems();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  const renderMenuItem = (item: NavigationMenu) => {
    const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as LucideIcon) : null;
    const isActive = item.path ? pathname === item.path : false;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="relative">
        {item.path ? (
          <div className="px-2">
            <Link
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "hover:bg-orange-100 text-gray-700"
              }`}
            >
              {IconComponent && <IconComponent className="shrink-0" size={20} />}
              <span className="truncate">{item.title}</span>
            </Link>
          </div>
        ) : (
          <div className="px-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {IconComponent && <IconComponent className="shrink-0" size={20} />}
              <span className="truncate">{item.title}</span>
            </div>
          </div>
        )}
        {hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2 space-y-1">
            {item.children?.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="py-4 h-full">
      <div className="space-y-1 mb-4">
        {menuItems.map(renderMenuItem)}
      </div>
      
      {/* User Profile and Logout Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <FaUser className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{session?.user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
} 