import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useRouterState } from "@tanstack/react-router";
import { Globe, LogIn, LogOut, Menu, User, UserPlus } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAgentInquiries,
  useBuyerInquiries,
  useIsAdmin,
  useUserProfile,
} from "../hooks/useQueries";

const NAV_LINKS = [
  { to: "/browse", label: "Available Properties", ocid: "nav.browse.link" },
  { to: "/agents", label: "Find Agents", ocid: "nav.agents.link" },
  { to: "/seller", label: "Sell", ocid: "nav.sell.link" },
  { to: "/rent-lounge", label: "Rent Lounge", ocid: "nav.rent_lounge.link" },
  { to: "/about", label: "About", ocid: "nav.about.link" },
  { to: "/supporters", label: "Our Supporters", ocid: "nav.supporters.link" },
  { to: "/trading", label: "Trading", ocid: "nav.trading.link" },
];

function PendingBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function TopNav() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const { data: buyerInquiries } = useBuyerInquiries();
  const { data: agentInquiries } = useAgentInquiries();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const isAgent = profile?.profileType.__kind__ === "agent";
  const isBuyer = profile?.profileType.__kind__ === "buyer";

  const pendingInquiryCount =
    identity && isBuyer && buyerInquiries
      ? buyerInquiries.filter((inq) => inq.status === "pending").length
      : 0;

  const pendingAgentInquiryCount =
    identity && isAgent && agentInquiries
      ? agentInquiries.filter((inq) => inq.status === "pending").length
      : 0;

  const allLinks = [
    ...NAV_LINKS,
    ...(identity && isBuyer
      ? [
          {
            to: "/dashboard",
            label: "My Dashboard",
            ocid: "nav.dashboard.link",
            badge: pendingInquiryCount,
          },
        ]
      : []),
    ...(identity && isAgent
      ? [
          {
            to: "/agent",
            label: "Agent Portal",
            ocid: "nav.agent.link",
            badge: pendingAgentInquiryCount,
          },
        ]
      : []),
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", ocid: "nav.admin.link", badge: 0 }]
      : []),
  ];

  function isActive(to: string) {
    return pathname === to || (to !== "/" && pathname.startsWith(to));
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            data-ocid="nav.link"
          >
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-display">
              <span className="text-primary">Global</span>
              <span className="text-foreground">Invest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                  isActive(link.to)
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid={link.ocid}
              >
                {link.label}
                {"badge" in link && <PendingBadge count={link.badge} />}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {identity ? (
              <>
                {!profile && (
                  <Link to="/onboarding">
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid="nav.complete_profile.button"
                    >
                      <User className="w-4 h-4 mr-1" /> Complete Profile
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clear}
                  data-ocid="nav.logout.button"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    size="sm"
                    variant="ghost"
                    data-ocid="nav.email_login.button"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5"
                    data-ocid="nav.signup.button"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" /> Sign Up
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="border-primary text-primary hover:bg-primary/10"
                  data-ocid="nav.login.button"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  {isLoggingIn ? "Connecting..." : "Connect"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Open navigation menu"
                data-ocid="nav.menu.toggle"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-border">
                  <Link
                    to="/"
                    className="flex items-center gap-2 font-bold text-xl"
                  >
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-display">
                      <span className="text-primary">Global</span>
                      <span className="text-foreground">Invest</span>
                    </span>
                  </Link>
                </div>
                <nav
                  className="flex flex-col gap-1 p-4 flex-1"
                  aria-label="Mobile navigation"
                >
                  {allLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                        isActive(link.to)
                          ? "text-primary bg-accent"
                          : "text-foreground hover:bg-muted"
                      }`}
                      data-ocid={`nav.mobile.${link.ocid}`}
                    >
                      {link.label}
                      {"badge" in link && <PendingBadge count={link.badge} />}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-border flex flex-col gap-2">
                  {identity ? (
                    <Button
                      variant="outline"
                      onClick={clear}
                      data-ocid="nav.mobile.logout.button"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button
                          variant="outline"
                          className="w-full"
                          data-ocid="nav.mobile.email_login.button"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button
                          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          data-ocid="nav.mobile.signup.button"
                        >
                          <UserPlus className="w-4 h-4 mr-1.5" /> Sign Up
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={login}
                        disabled={isLoggingIn}
                        className="w-full border-primary text-primary hover:bg-primary/10"
                        data-ocid="nav.mobile.login.button"
                      >
                        <LogIn className="w-4 h-4 mr-1" />
                        {isLoggingIn ? "Connecting..." : "Connect Wallet"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
