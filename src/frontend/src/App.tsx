import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import CompareTray from "./components/CompareTray";
import Footer from "./components/Footer";
import TopNav from "./components/TopNav";
import { CompareProvider } from "./context/CompareContext";
import AboutPage from "./pages/AboutPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import AgentProfilePage from "./pages/AgentProfilePage";
import AgentsDirectoryPage from "./pages/AgentsDirectoryPage";
import BrowsePage from "./pages/BrowsePage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import ComparePage from "./pages/ComparePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NewsListingPage from "./pages/NewsListingPage";
import OnboardingPage from "./pages/OnboardingPage";
import OurSupportersPage from "./pages/OurSupportersPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import RentLoungePage from "./pages/RentLoungePage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerHomePage from "./pages/SellerHomePage";
import SignupPage from "./pages/SignupPage";
import TradingPage from "./pages/TradingPage";

function RootLayout() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main>
        <div key={pathname} className="page-transition flex-1">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CompareTray />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: BrowsePage,
});

const rentLoungeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rent-lounge",
  component: RentLoungePage,
});

const agentsDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agents",
  component: AgentsDirectoryPage,
});

const agentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agents/$agentId",
  component: AgentProfilePage,
});

const propertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: ComparePage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: BuyerDashboardPage,
});

const agentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agent",
  component: AgentDashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const supportersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/supporters",
  component: OurSupportersPage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/news",
  component: NewsListingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

const sellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller",
  component: SellerHomePage,
});

const sellerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller-dashboard",
  component: SellerDashboardPage,
});

const tradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trading",
  component: TradingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  rentLoungeRoute,
  agentsDirectoryRoute,
  agentProfileRoute,
  propertyRoute,
  compareRoute,
  onboardingRoute,
  dashboardRoute,
  agentRoute,
  adminRoute,
  aboutRoute,
  supportersRoute,
  newsRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  sellerRoute,
  sellerDashboardRoute,
  tradingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CompareProvider>
      <RouterProvider router={router} />
    </CompareProvider>
  );
}
