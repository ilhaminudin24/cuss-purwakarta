"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Navigation />;
} 