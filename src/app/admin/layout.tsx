"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  FileText,
  Users,
  Calendar,
  Store,
  Newspaper,
  Handshake,
  Settings,
  LogOut,
  ArrowLeft,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

// Sidebar link item structure
type NavItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Content Management",
    icon: <FileText className="w-5 h-5" />,
    children: [
      { label: "Publications", href: "/admin/content/publications" },
      { label: "Alka Library", href: "/admin/content/books" },
      { label: "Our Voice", href: "/admin/content/our-voice" },
      { label: "Toolkits & Guides", href: "/admin/content/toolkits" },
    ],
  },
  {
    label: "Members & Community",
    icon: <Users className="w-5 h-5" />,
    children: [
      { label: "Members", href: "/admin/members" },
      { label: "Partnerships", href: "/admin/members/partnerships" },
      { label: "Volunteers/Jobs", href: "/admin/members/volunteers" },
      { label: "Contact Us", href: "/admin/members/contact" },
      { label: "Newsletter/Mailing", href: "/admin/members/newsletter" },
    ],
  },
  {
    label: "Events",
    icon: <Calendar className="w-5 h-5" />,
    children: [
      { label: "All Events", href: "/admin/events" },
      { label: "Past Events Carousel", href: "/admin/events/past" },
    ],
  },
  {
    label: "Donations & Payment",
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { label: "Member Payment", href: "/admin/payments/members" },
      { label: "Donations", href: "/admin/payments/donations" },
      { label: "E-commerce", href: "/admin/payments/ecommerce" },
      { label: "Events", href: "/admin/payments/events" },
    ],
  },
  {
    label: "Shop Management",
    href: "/admin/shop",
    icon: <Store className="w-5 h-5" />,
  },
  {
    label: "News",
    href: "/admin/news",
    icon: <Newspaper className="w-5 h-5" />,
  },
  {
    label: "Get Involved",
    href: "/admin/get-involved",
    icon: <Handshake className="w-5 h-5" />,
  },
  {
    label: "Site Management",
    href: "/admin/site-management",
    icon: <Settings className="w-5 h-5" />,
  },
];

function SidebarItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href?: string) => (href ? pathname.startsWith(href) : false);

  if (item.children && item.children.length > 0) {
    const anyChildActive = item.children.some((c) => isActive(c.href));
    return (
      <div className="mb-1">
        {/* Dropdown toggle and nested links */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left hover:bg-gray-800 transition-colors ${
            anyChildActive ? "bg-gray-800" : ""
          }`}
        >
          <span className="text-gray-200">{item.icon}</span>
          <span className="flex-1 text-sm">{item.label}</span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {open && (
          <div className="mt-1 ml-2 border-l border-gray-800">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={`block px-4 py-2 text-sm rounded-md ml-2 my-0.5 hover:bg-gray-800 transition-colors ${
                  isActive(child.href) ? "bg-gray-800 text-white" : "text-gray-300"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      onClick={onNavigate}
      className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${
        isActive(item.href) ? "bg-gray-800" : ""
      }`}
    >
      <span className="text-gray-200">{item.icon}</span>
      <span className="text-sm">{item.label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthPage = pathname === '/admin/login';

  // Close mobile menu when pathname changes (navigation occurs)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isAuthPage) return; // Allow login page without session
    if (status === 'loading') return; // Still loading
    if (!session) { router.push('/admin/login'); return; }
    // Check if user has admin access
    if (session.user?.role && !['admin', 'editor', 'reviewer', 'finance'].includes(session.user.role)) {
      router.push('/admin/login?error=AccessDenied');
      return;
    }
  }, [session, status, router]);

  // Allow login page to render without sidebar/auth chrome
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-gray-900 text-white flex flex-col transform transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar header (brand + close on mobile) */}
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-xl font-semibold">
              Admin Portal
            </Link>
          <button
              className="md:hidden p-2 rounded hover:bg-gray-800"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
          >
              <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
          {/* Sidebar Section: Content Management, Members, Payments etc. */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
              </div>
              
        {/* Sidebar bottom: user, settings, sign out */}
        <div className="p-4 border-t border-gray-800">
          <div className="mb-3">
            <div className="text-sm font-medium">{session.user?.name || 'Admin'}</div>
            <div className="text-xs text-gray-400 capitalize">{session.user?.role || 'Administrator'}</div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Link
              href="#"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
                </div>
              </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top bar with hamburger (mobile) + breadcrumb/title and back link */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded border border-gray-200 bg-white shadow-sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">Admin</span>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-600">Section</span>
            </div>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to main site
          </Link>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}