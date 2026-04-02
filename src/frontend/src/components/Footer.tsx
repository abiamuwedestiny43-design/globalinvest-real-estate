import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-primary-foreground opacity-80" />
              <span className="font-display text-xl font-bold">
                <span className="opacity-90">Global</span>
                <span className="opacity-70">Invest</span>
              </span>
            </div>
            <p className="text-sm opacity-60 max-w-xs leading-relaxed">
              Your global gateway to premium real estate investments. Connecting
              buyers, agents, and sellers worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest opacity-50">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Available Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/rent-lounge"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Rent Lounge
                </Link>
              </li>
              <li>
                <Link
                  to="/onboarding"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Join as Agent
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest opacity-50">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/about"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <span className="opacity-40 cursor-default text-sm">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm opacity-50">
          <p>
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100"
            >
              caffeine.ai
            </a>
          </p>
          <p>GlobalInvest Real Estate — Global Multi-Currency Marketplace</p>
        </div>
      </div>
    </footer>
  );
}
