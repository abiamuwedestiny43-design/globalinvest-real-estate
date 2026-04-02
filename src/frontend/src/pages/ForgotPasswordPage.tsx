import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Globe, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Globe className="w-7 h-7 text-accent" />
            <span className="font-serif text-2xl font-bold text-primary">
              GlobalInvest
            </span>
          </Link>
          <h1 className="font-serif text-3xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground mt-1">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-4" data-ocid="forgot.success_state">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-semibold text-lg mb-2">Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-6">
                If <strong>{email}</strong> is registered, you'll receive a
                password reset link shortly.
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full"
                  data-ocid="forgot.back_to_login.button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-1"
                  autoComplete="email"
                  data-ocid="forgot.email.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:opacity-90"
                data-ocid="forgot.submit.button"
              >
                Send Reset Link
              </Button>
              <Link
                to="/login"
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
                data-ocid="forgot.login.link"
              >
                <ArrowLeft className="inline w-3 h-3 mr-1" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
