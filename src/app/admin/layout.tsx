import { headers } from 'next/headers';
import AdminLayoutClient from './AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dynamic rendering at the layout level
  headers();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
} 