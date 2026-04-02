import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Globe, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    toast.info(
      'Email login is coming soon. Use "Connect with Internet Identity" to authenticate now.',
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Globe className="w-7 h-7 text-accent" />
            <span className="font-serif text-2xl font-bold text-primary">
              GlobalInvest
            </span>
          </Link>
          <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Internet Identity */}
          <Button
            className="w-full bg-accent text-accent-foreground hover:opacity-90 mb-6"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="login.ii.button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Connecting..." : "Continue with Internet Identity"}
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 mb-6">
            💡 For demo access, use the <strong>Internet Identity</strong>{" "}
            button above. Email/password login is coming soon.
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
                autoComplete="email"
                data-ocid="login.email.input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent hover:underline"
                  data-ocid="login.forgot_password.link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  data-ocid="login.password_toggle.button"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              data-ocid="login.submit.button"
            >
              Sign In with Email
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-accent hover:underline font-medium"
              data-ocid="login.signup.link"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
