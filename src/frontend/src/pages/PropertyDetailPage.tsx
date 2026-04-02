import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import {
  Bath,
  Bed,
  Calculator,
  CalendarCheck2,
  CalendarDays,
  Heart,
  HeartOff,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImageGallery from "../components/ImageGallery";
import MapEmbed from "../components/MapEmbed";
import MortgageCalculator from "../components/MortgageCalculator";
import NeighborhoodStats from "../components/NeighborhoodStats";
import { formatPrice } from "../components/PropertyCard";
import ReviewsSection from "../components/ReviewsSection";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFavorite,
  useFavoriteProperties,
  useInquireProperty,
  usePropertyDetails,
  useRemoveFavorite,
} from "../hooks/useQueries";

import { CURRENCY_LIST, CURRENCY_NAMES } from "../lib/currencies";

const CURRENCIES = CURRENCY_LIST;

export default function PropertyDetailPage() {
  const { id } = useParams({ from: "/property/$id" });
  const { identity, login } = useInternetIdentity();
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const [viewingName, setViewingName] = useState("");
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [viewingNotes, setViewingNotes] = useState("");
  const [viewingSubmitted, setViewingSubmitted] = useState(false);
  const [viewingExpanded, setViewingExpanded] = useState(false);
  const [mortgageExpanded, setMortgageExpanded] = useState(false);

  const propertyId = BigInt(id);
  const { data: property, isLoading } = usePropertyDetails(propertyId);
  const { data: favorites } = useFavoriteProperties();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const inquire = useInquireProperty();

  const isFav = favorites?.some((f) => f.id === propertyId) ?? false;

  function toggleFav() {
    if (!identity) {
      toast.error("Please login to save properties");
      return;
    }
    if (isFav) {
      removeFav.mutate(propertyId, {
        onSuccess: () => toast.success("Removed from favorites"),
      });
    } else {
      addFav.mutate(propertyId, {
        onSuccess: () => toast.success("Added to favorites"),
      });
    }
  }

  function submitInquiry() {
    if (!inquiryMsg.trim()) return;
    inquire.mutate(
      { propertyId, message: inquiryMsg },
      {
        onSuccess: () => {
          toast.success("Inquiry sent! The agent will contact you shortly.");
          setInquiryOpen(false);
          setInquiryMsg("");
        },
        onError: () => toast.error("Failed to send inquiry. Please try again."),
      },
    );
  }

  function submitViewing(e: React.FormEvent) {
    e.preventDefault();
    const message = `Viewing Request\nName: ${viewingName}\nDate: ${viewingDate}\nTime: ${viewingTime}\nNotes: ${viewingNotes}`;
    inquire.mutate(
      { propertyId, message },
      {
        onSuccess: () => {
          toast.success("Viewing scheduled successfully!");
          setViewingSubmitted(true);
        },
        onError: () =>
          toast.error("Failed to schedule viewing. Please try again."),
      },
    );
  }

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10"
        id="main-content"
        data-ocid="property.loading_state"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <div>
            <Skeleton className="aspect-[16/9] w-full rounded-xl mb-3" />
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-2/3 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[520px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        id="main-content"
        data-ocid="property.error_state"
      >
        <h2 className="font-display text-2xl font-bold mb-2">
          Property Not Found
        </h2>
        <p className="text-muted-foreground">
          This listing may have been removed or is unavailable.
        </p>
      </div>
    );
  }

  const images = property.images.map((img) => img.getDirectURL());
  const secondaryCurrency =
    CURRENCIES.find((c) => c !== displayCurrency) ?? "EUR";

  return (
    <div className="container mx-auto px-4 py-8" id="main-content">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10">
        {/* LEFT COLUMN: Gallery + Details */}
        <div>
          <div className="mb-6">
            <ImageGallery images={images} alt={property.title} />
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <Badge variant="secondary" className="mb-2 capitalize text-xs">
                {property.propertyType}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                {property.title}
              </h1>
            </div>
            <button
              type="button"
              onClick={toggleFav}
              className="p-2.5 rounded-full border border-border hover:bg-muted transition-colors mt-1 shrink-0"
              aria-label={isFav ? "Remove from favorites" : "Save property"}
              data-ocid="property.favorite.toggle"
            >
              {isFav ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              ) : (
                <HeartOff className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>
              {property.address}, {property.city}, {property.country}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              {
                label: "Bedrooms",
                value: property.bedrooms.toString(),
                Icon: Bed,
              },
              {
                label: "Bathrooms",
                value: property.bathrooms.toString(),
                Icon: Bath,
              },
              { label: "Area", value: `${property.area} m²`, Icon: Maximize2 },
              { label: "Status", value: property.status, Icon: ShieldCheck },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-muted rounded-xl p-4 text-center border border-border"
              >
                <s.Icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                <p className="text-sm font-semibold capitalize">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {property.description && (
            <section className="mb-8" aria-label="Property description">
              <h2 className="font-display text-xl font-semibold mb-3">
                Description
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </section>
          )}

          {property.features.length > 0 && (
            <section className="mb-8" aria-label="Features and amenities">
              <h2 className="font-display text-xl font-semibold mb-3">
                Features &amp; Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Neighborhood Stats */}
          <NeighborhoodStats propertyId={id} />

          <section aria-label="Property location">
            <h2 className="font-display text-xl font-semibold mb-3">
              Location
            </h2>
            <MapEmbed
              address={property.address}
              city={property.city}
              country={property.country}
            />
          </section>
          <section aria-label="Reviews" className="mt-8">
            <ReviewsSection propertyId={propertyId} />
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky price panel */}
        <div>
          <div className="sticky top-24 space-y-4">
            {/* Price + CTA panel */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Asking Price
                </p>
                <p className="font-display text-4xl font-bold text-foreground">
                  {formatPrice(
                    property.price,
                    property.currency,
                    displayCurrency,
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈{" "}
                  {formatPrice(
                    property.price,
                    property.currency,
                    secondaryCurrency,
                  )}{" "}
                  {CURRENCY_NAMES[secondaryCurrency] || secondaryCurrency}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {CURRENCIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setDisplayCurrency(c)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors text-center min-w-[90px] ${
                      displayCurrency === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                    data-ocid={`property.currency_${c.toLowerCase()}.toggle`}
                  >
                    <span className="block font-medium leading-tight">
                      {CURRENCY_NAMES[c] || c}
                    </span>
                    <span className="block text-[10px] opacity-60 leading-tight">
                      {c}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 text-sm mb-6 py-4 border-y border-border">
                {Number(property.bedrooms) > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Bed className="w-4 h-4 text-primary" />
                    {property.bedrooms.toString()} bed
                  </span>
                )}
                {Number(property.bathrooms) > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Bath className="w-4 h-4 text-primary" />
                    {property.bathrooms.toString()} bath
                  </span>
                )}
                {property.area > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Maximize2 className="w-4 h-4 text-primary" />
                    {property.area} m²
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-5">
                <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium rounded-xl"
                      data-ocid="property.contact_agent.button"
                    >
                      <Send className="w-4 h-4 mr-2" /> Contact Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-ocid="property.inquiry.dialog">
                    <DialogHeader>
                      <DialogTitle>Send an Inquiry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        About: <strong>{property.title}</strong>
                      </p>
                      <div>
                        <Label htmlFor="inquiry-msg">Your Message</Label>
                        <Textarea
                          id="inquiry-msg"
                          placeholder="Hi, I'm interested in this property..."
                          value={inquiryMsg}
                          onChange={(e) => setInquiryMsg(e.target.value)}
                          rows={5}
                          className="mt-1"
                          data-ocid="property.inquiry.textarea"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setInquiryOpen(false)}
                          data-ocid="property.inquiry.cancel.button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitInquiry}
                          disabled={!inquiryMsg.trim() || inquire.isPending}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          data-ocid="property.inquiry.submit.button"
                        >
                          {inquire.isPending ? "Sending..." : "Send Inquiry"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full h-11 border-primary text-primary hover:bg-primary/10 font-medium rounded-xl"
                  onClick={() => setViewingExpanded(!viewingExpanded)}
                  data-ocid="property.book_visit.button"
                >
                  <CalendarDays className="w-4 h-4 mr-2" /> Book Visit
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-border text-muted-foreground hover:border-primary hover:text-primary font-medium rounded-xl"
                  onClick={() => setMortgageExpanded(!mortgageExpanded)}
                  data-ocid="property.mortgage_calculator.toggle"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Mortgage Calculator
                </Button>

                <Button
                  variant="ghost"
                  className="w-full h-10 text-muted-foreground hover:text-foreground"
                  onClick={toggleFav}
                  data-ocid="property.save.button"
                >
                  {isFav ? (
                    <>
                      <HeartOff className="w-4 h-4 mr-2" /> Remove from Saved
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" /> Save Property
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Listed by
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">A</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm">Verified Agent</p>
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className="w-3 h-3 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {property.city}, {property.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>contact@globalinvest.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>+1 (800) 555-0100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Viewing — collapsible */}
            {viewingExpanded && (
              <div
                className="bg-card rounded-2xl border border-border shadow-card p-6"
                data-ocid="viewing.panel"
              >
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Schedule a Viewing
                </h2>

                {!identity ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4 text-sm">
                      Please log in to schedule a viewing.
                    </p>
                    <Button
                      onClick={login}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid="viewing.login.button"
                    >
                      Log In
                    </Button>
                  </div>
                ) : viewingSubmitted ? (
                  <div
                    className="text-center py-6"
                    data-ocid="viewing.success_state"
                  >
                    <CalendarCheck2 className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-lg mb-1">
                      Viewing Scheduled!
                    </p>
                    <p className="text-muted-foreground text-sm">
                      The agent will confirm shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submitViewing} className="space-y-4">
                    <div>
                      <Label htmlFor="viewing-name">Your Name</Label>
                      <Input
                        id="viewing-name"
                        type="text"
                        required
                        value={viewingName}
                        onChange={(e) => setViewingName(e.target.value)}
                        placeholder="Full name"
                        className="mt-1"
                        data-ocid="viewing.name.input"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="viewing-date">Preferred Date</Label>
                        <Input
                          id="viewing-date"
                          type="date"
                          required
                          value={viewingDate}
                          onChange={(e) => setViewingDate(e.target.value)}
                          className="mt-1"
                          data-ocid="viewing.date.input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="viewing-time">Preferred Time</Label>
                        <Select
                          value={viewingTime}
                          onValueChange={setViewingTime}
                          required
                        >
                          <SelectTrigger
                            id="viewing-time"
                            className="mt-1"
                            data-ocid="viewing.time.select"
                          >
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Morning">
                              Morning (9am – 12pm)
                            </SelectItem>
                            <SelectItem value="Afternoon">
                              Afternoon (12pm – 5pm)
                            </SelectItem>
                            <SelectItem value="Evening">
                              Evening (5pm – 8pm)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="viewing-notes">
                        Notes{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id="viewing-notes"
                        value={viewingNotes}
                        onChange={(e) => setViewingNotes(e.target.value)}
                        placeholder="Any special requests or questions..."
                        rows={3}
                        className="mt-1"
                        data-ocid="viewing.notes.textarea"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={
                        inquire.isPending ||
                        !viewingName ||
                        !viewingDate ||
                        !viewingTime
                      }
                      data-ocid="viewing.submit.button"
                    >
                      {inquire.isPending ? "Scheduling..." : "Schedule Viewing"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Mortgage Calculator — collapsible */}
            {mortgageExpanded && (
              <div
                className="bg-card rounded-2xl border border-border shadow-card p-6"
                data-ocid="mortgage.card"
              >
                <MortgageCalculator
                  price={property.price}
                  currency={property.currency || "USD"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
