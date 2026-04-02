import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Briefcase, Home, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Role = "buyer" | "agent" | null;

export default function OnboardingPage() {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [bio, setBio] = useState("");

  async function handleSubmit() {
    if (!actor || !identity) {
      toast.error("Please login first");
      return;
    }
    if (!firstName || !lastName || !email) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const contactInfo = { email, phone, city, country, address };
      const principal = identity.getPrincipal();

      if (role === "buyer") {
        await actor.createBuyerProfile({
          principal,
          firstName,
          lastName,
          contactInfo,
        });
        toast.success("Buyer profile created!");
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        navigate({ to: "/dashboard" });
      } else if (role === "agent") {
        if (!licenseNumber || !agencyName) {
          toast.error("License number and agency name are required");
          setLoading(false);
          return;
        }
        await actor.createAgentProfile({
          principal,
          firstName,
          lastName,
          contactInfo,
          licenseNumber,
          agency: agencyName,
          bio,
          verified: false,
          rating: 0,
        });
        toast.success("Agent profile created! Pending verification.");
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        navigate({ to: "/agent" });
      }
    } catch {
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground">
          Please login with Internet Identity to create your profile.
        </p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-serif text-4xl font-bold mb-3">
            Welcome to GlobalInvest
          </h1>
          <p className="text-muted-foreground mb-10">
            Choose your account type to get started
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className="group p-8 rounded-2xl border-2 border-border hover:border-accent transition-all text-left"
              data-ocid="onboarding.buyer.button"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                <Home className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">I'm a Buyer</h3>
              <p className="text-muted-foreground text-sm">
                Browse listings, save properties, contact agents, and manage
                your investment portfolio.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("agent")}
              className="group p-8 rounded-2xl border-2 border-border hover:border-accent transition-all text-left"
              data-ocid="onboarding.agent.button"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                <Briefcase className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                I'm an Agent
              </h3>
              <p className="text-muted-foreground text-sm">
                List properties, manage leads, get verified badge, and grow your
                international client base.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setRole(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="onboarding.back.button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {role === "buyer"
                ? "Create Buyer Profile"
                : "Create Agent Profile"}
            </CardTitle>
            <CardDescription>
              {role === "agent"
                ? "You'll need to provide your license details for verification."
                : "Fill in your details to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1"
                  data-ocid="onboarding.first_name.input"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1"
                  data-ocid="onboarding.last_name.input"
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                data-ocid="onboarding.email.input"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                data-ocid="onboarding.phone.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                  data-ocid="onboarding.city.input"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1"
                  data-ocid="onboarding.country.input"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                data-ocid="onboarding.address.input"
              />
            </div>

            {role === "agent" && (
              <>
                <div>
                  <Label>License Number *</Label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="mt-1"
                    data-ocid="onboarding.license.input"
                  />
                </div>
                <div>
                  <Label>Agency Name *</Label>
                  <Input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="mt-1"
                    data-ocid="onboarding.agency.input"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1"
                    placeholder="Tell buyers about your experience and expertise..."
                    data-ocid="onboarding.bio.textarea"
                  />
                </div>
              </>
            )}

            <Button
              className="w-full bg-accent text-accent-foreground hover:opacity-90"
              onClick={handleSubmit}
              disabled={loading}
              data-ocid="onboarding.submit.button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                  Profile...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
