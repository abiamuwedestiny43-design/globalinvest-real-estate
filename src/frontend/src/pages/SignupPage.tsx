import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Home,
  LogIn,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Role = "buyer" | "agent" | "seller";
type DocType = "passport" | "national_id" | "drivers_license";

function getPasswordStrength(pw: string): {
  level: number;
  label: string;
  color: string;
} {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { level: 2, label: "Fair", color: "bg-yellow-500" };
  return { level: 3, label: "Strong", color: "bg-green-500" };
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type))
    return "Unsupported file type. Use JPG, PNG, WebP, or PDF.";
  if (file.size > MAX_SIZE) return "File must be 5MB or less.";
  return null;
}

interface DropZoneProps {
  label: string;
  required?: boolean;
  file: File | null;
  preview: string;
  onFile: (file: File, preview: string) => void;
  onClear: () => void;
  ocidPrefix: string;
}

function DropZone({
  label,
  required,
  file,
  preview,
  onFile,
  onClear,
  ocidPrefix,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        toast.error(err);
        return;
      }
      const url = f.type === "application/pdf" ? "" : URL.createObjectURL(f);
      onFile(f, url);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  return (
    <div>
      <Label className="text-xs font-medium mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {file ? (
        <div className="relative rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
          {preview ? (
            <img
              src={preview}
              alt="ID document preview"
              className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-12 flex items-center justify-center bg-muted rounded-lg flex-shrink-0">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex-shrink-0 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove file"
            data-ocid={`${ocidPrefix}.delete_button`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed bg-muted/30 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/60 hover:bg-muted/50"
          }`}
          data-ocid={`${ocidPrefix}.dropzone`}
        >
          <Upload
            className={`w-5 h-5 ${
              dragging ? "text-accent" : "text-muted-foreground"
            }`}
          />
          <p className="text-xs text-muted-foreground text-center">
            <span className="text-accent font-medium">Click to browse</span> or
            drag & drop
          </p>
          <p className="text-[10px] text-muted-foreground">
            JPG, PNG, WebP, PDF · Max 5MB
          </p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleChange}
        data-ocid={`${ocidPrefix}.upload_button`}
      />
    </div>
  );
}

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  { value: "buyer", label: "Buyer", desc: "Browse & invest", Icon: User },
  { value: "agent", label: "Agent", desc: "List properties", Icon: Briefcase },
  { value: "seller", label: "Seller", desc: "Sell directly", Icon: Home },
];

export default function SignupPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const [_submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<Role>("buyer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // ID document state
  const [idDocType, setIdDocType] = useState<DocType>("passport");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState("");
  const [idBackPreview, setIdBackPreview] = useState("");

  const strength = getPasswordStrength(password);

  function clearFront() {
    if (idFrontPreview) URL.revokeObjectURL(idFrontPreview);
    setIdFront(null);
    setIdFrontPreview("");
  }

  function clearBack() {
    if (idBackPreview) URL.revokeObjectURL(idBackPreview);
    setIdBack(null);
    setIdBackPreview("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    if (!idFront) {
      toast.error("Please upload the front of your ID document.");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }
    try {
      const frontBlob = {
        id: `signup-front-${Date.now().toString()}`,
        url: "",
      };
      const backBlobOpt: [] | [{ id: string; url: string }] = idBack
        ? [{ id: `signup-back-${Date.now().toString()}`, url: "" }]
        : [];
      await (actor as any).submitIdDocument(
        firstName,
        lastName,
        email,
        idDocType,
        frontBlob,
        backBlobOpt,
      );
      setSubmitted(true);
      toast.success(
        "Account created! Your ID document has been submitted for review.",
      );
    } catch {
      toast.error("Failed to submit ID document. Please try again.");
    }
  }

  const docTypeOptions: { value: DocType; label: string }[] = [
    { value: "passport", label: "Passport" },
    { value: "national_id", label: "National ID" },
    { value: "drivers_license", label: "Driver's License" },
  ];

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
          <h1 className="font-serif text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">
            Start investing globally today
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Internet Identity */}
          <Button
            className="w-full bg-accent text-accent-foreground hover:opacity-90 mb-6"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="signup.ii.button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Connecting..." : "Continue with Internet Identity"}
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              or create with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Role selection */}
          <div className="mb-5">
            <Label className="text-xs font-medium mb-3 block">I am a...</Label>
            <div className="grid grid-cols-3 gap-3">
              {ROLE_OPTIONS.map(({ value, label, desc, Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRole(value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    role === value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  data-ocid={`signup.role_${value}.toggle`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1.5 ${
                      role === value ? "text-accent" : "text-muted-foreground"
                    }`}
                  />
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>

            {/* Seller note */}
            {role === "seller" && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/5 px-3.5 py-3">
                <Building2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent leading-relaxed">
                  You'll be able to list properties directly in your{" "}
                  <Link
                    to="/seller-dashboard"
                    className="underline font-semibold"
                  >
                    Seller Dashboard
                  </Link>{" "}
                  after account creation.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="signup-fname">First Name</Label>
                <Input
                  id="signup-fname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Jane"
                  className="mt-1"
                  data-ocid="signup.first_name.input"
                />
              </div>
              <div>
                <Label htmlFor="signup-lname">Last Name</Label>
                <Input
                  id="signup-lname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Smith"
                  className="mt-1"
                  data-ocid="signup.last_name.input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-email">Email Address</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
                autoComplete="email"
                data-ocid="signup.email.input"
              />
            </div>

            <div>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  data-ocid="signup.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-ocid="signup.password_toggle.button"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-colors ${
                          strength.level >= lvl ? strength.color : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Password strength:{" "}
                    <span
                      className={
                        strength.level === 3
                          ? "text-green-600"
                          : strength.level === 2
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <Input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="mt-1"
                autoComplete="new-password"
                data-ocid="signup.confirm_password.input"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="signup.password_mismatch.error_state"
                >
                  Passwords do not match
                </p>
              )}
            </div>

            {/* ── Identity Verification Section ── */}
            <div
              className="rounded-xl border border-border bg-muted/20 p-4 space-y-4"
              data-ocid="signup.id_verification.panel"
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Identity Verification</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required to verify your identity. Accepted: JPG, PNG, WebP,
                    PDF. Max 5MB.
                  </p>
                </div>
              </div>

              {/* Document type selector */}
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Document Type
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {docTypeOptions.map(({ value, label }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setIdDocType(value);
                        if (value === "passport") clearBack();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        idDocType === value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                      }`}
                      data-ocid={`signup.id_doc_type_${value}.toggle`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Front upload */}
              <DropZone
                label="Front of document"
                required
                file={idFront}
                preview={idFrontPreview}
                onFile={(f, p) => {
                  setIdFront(f);
                  setIdFrontPreview(p);
                }}
                onClear={clearFront}
                ocidPrefix="signup.id_front"
              />

              {/* Back upload — hidden for passport */}
              {idDocType !== "passport" && (
                <DropZone
                  label="Back of document"
                  file={idBack}
                  preview={idBackPreview}
                  onFile={(f, p) => {
                    setIdBack(f);
                    setIdBackPreview(p);
                  }}
                  onClear={clearBack}
                  ocidPrefix="signup.id_back"
                />
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="signup-terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
                data-ocid="signup.terms.checkbox"
              />
              <Label
                htmlFor="signup-terms"
                className="text-sm font-normal leading-snug"
              >
                I agree to the{" "}
                <span className="text-accent cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-accent cursor-pointer hover:underline">
                  Privacy Policy
                </span>
              </Label>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={!agreed}
              data-ocid="signup.submit.button"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
              data-ocid="signup.login.link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
