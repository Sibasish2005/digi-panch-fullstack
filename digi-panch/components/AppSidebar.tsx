'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  ListTodo, 
  Users, 
  Activity, 
  LogOut,
  Bot,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="w-64 animate-pulse bg-gray-100 h-screen" />;

  // Quick heuristic for roles based on public metadata or email (adjust as needed for your DB)
  // For demo, we check if the URL path matches their dashboard preference, or default to checking metadata
  const role = user?.publicMetadata?.role as string || 'CITIZEN';

  const citizenLinks = [
    { name: 'Dashboard', href: '/citizen', icon: Home },
    { name: 'Apply for Document', href: '/citizen/apply', icon: FileText },
    { name: 'My Applications', href: '/citizen/applications', icon: ListTodo },
    { name: 'Grievances', href: '/citizen/grievances', icon: MessageSquare },
  ];

  const officerLinks = [
    { name: 'Pending Queue', href: '/officer', icon: ListTodo },
    { name: 'Grievances', href: '/officer/grievances', icon: MessageSquare },
  ];

  const adminLinks = [
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Document Types', href: '/admin/document-types', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
  ];

  let links = citizenLinks;
  if (pathname.startsWith('/officer') || role === 'OFFICER') {
    links = officerLinks;
  }
  if (pathname.startsWith('/admin') || role === 'ADMIN') {
    links = adminLinks;
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">DigiPanch</h2>
        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">
          {role} PORTAL
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600">
          <SignOutButton>
            <button className="flex items-center gap-3 w-full hover:text-red-600 transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
