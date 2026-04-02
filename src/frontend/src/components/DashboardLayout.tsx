import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bell, Globe, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  breadcrumb?: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
  breadcrumb,
  activeSection,
  onSectionChange,
}: DashboardLayoutProps) {
  const { identity } = useInternetIdentity();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const initials = identity
    ? identity.getPrincipal().toString().slice(0, 2).toUpperCase()
    : "?";

  function isActive(item: NavItem) {
    if (activeSection && item.section) {
      return activeSection === item.section;
    }
    return pathname === item.href;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-secondary text-secondary-foreground">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 font-bold text-base">
          <Globe className="w-5 h-5 opacity-80" />
          <span className="font-display">
            <span className="opacity-90">Global</span>
            <span className="opacity-60">Invest</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 p-3 space-y-0.5 overflow-y-auto"
        aria-label="Dashboard navigation"
      >
        {navItems.map((item) => {
          const active = isActive(item);
          const handleClick =
            item.section && onSectionChange
              ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  onSectionChange(item.section!);
                }
              : undefined;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              to={item.href}
              onClick={handleClick}
              data-ocid={`dashboard.nav.${item.label.toLowerCase().replace(/\s+/g, "-")}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/70 hover:bg-white/10 hover:text-secondary-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
                  aria-label={`${item.badge} pending`}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User avatar at bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-foreground">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate opacity-80">Connected</p>
            <p className="text-xs opacity-50 truncate">
              {identity
                ? `${identity.getPrincipal().toString().slice(0, 16)}...`
                : "\u2014"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-60 shrink-0 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-1.5"
                  aria-label="Open sidebar"
                  data-ocid="dashboard.sidebar.toggle"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div>
              {breadcrumb && (
                <p className="text-xs text-muted-foreground mb-0.5">
                  {breadcrumb}
                </p>
              )}
              <h1 className="text-base font-semibold text-foreground font-display">
                {title}
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Notifications"
            data-ocid="dashboard.notifications.button"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
