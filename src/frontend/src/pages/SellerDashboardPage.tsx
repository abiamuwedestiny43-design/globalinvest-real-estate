import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  Edit2,
  Home,
  ImageOff,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CURRENCY_LIST, currencyLabel } from "../lib/currencies";

interface ImagePreview {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface MockListing {
  id: string;
  title: string;
  location: string;
  country: string;
  price: string;
  currency: string;
  status: "Active" | "Pending Review" | "Sold" | "Rejected";
  thumbnail: string;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70";

const STATUS_COLORS: Record<string, string> = {
  Active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Pending Review":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Sold: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const MAX_IMAGES = 10;

function ImageDropZone({
  images,
  onAdd,
  onRemove,
}: {
  images: ImagePreview[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
    },
    [onAdd],
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        disabled={images.length >= MAX_IMAGES}
        className={`w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : images.length >= MAX_IMAGES
              ? "border-border bg-muted/20 cursor-not-allowed opacity-50"
              : "border-border hover:border-primary/60 hover:bg-muted/40"
        }`}
        data-ocid="seller.upload.dropzone"
      >
        <Upload
          className={`w-8 h-8 ${dragging ? "text-primary" : "text-muted-foreground"}`}
        />
        <div className="text-center">
          <p className="text-sm font-medium">
            <span className="text-primary">
              Drag &amp; drop property images here
            </span>{" "}
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP · Max 10 images · {images.length}/{MAX_IMAGES}{" "}
            uploaded
          </p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAdd(e.target.files);
        }}
        data-ocid="seller.upload.upload_button"
      />
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden aspect-square bg-muted"
              data-ocid={`seller.image_preview.item.${idx + 1}`}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
                data-ocid={`seller.image_preview.delete_button.${idx + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerDashboardPage() {
  const { actor } = useActor();

  // Upload form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [propType, setPropType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState("Sarah Thompson");
  const [profileEmail, setProfileEmail] = useState("sarah.thompson@email.com");
  const [profilePhone, setProfilePhone] = useState("+1 555 234 5678");
  const [profileCountry, setProfileCountry] = useState("United States");

  // Listings state
  const [listings, setListings] = useState<MockListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const loadListings = useCallback(async () => {
    if (!actor) return;
    try {
      setLoadingListings(true);
      const subs = (await (actor as any).getMySellerSubmissions()) as Array<{
        id: bigint;
        title: string;
        location: string;
        country: string;
        price: number;
        currency: string;
        status: { __kind__: string };
        imageUrls: string[];
      }>;
      setListings(
        subs.map((sub) => ({
          id: String(sub.id),
          title: sub.title,
          location: sub.location,
          country: sub.country,
          price: String(sub.price),
          currency: sub.currency,
          status:
            sub.status.__kind__ === "pending"
              ? "Pending Review"
              : sub.status.__kind__ === "approved"
                ? "Active"
                : "Rejected",
          thumbnail: sub.imageUrls[0] ?? FALLBACK_THUMB,
        })),
      );
    } catch {
      toast.error("Failed to load your listings.");
    } finally {
      setLoadingListings(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) {
      loadListings();
    } else {
      setLoadingListings(false);
    }
  }, [actor, loadListings]);

  function addImages(files: FileList) {
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const previews: ImagePreview[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...previews]);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price || !location || !country || !propType) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one property image.");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please wait and try again.");
      return;
    }
    setSubmitting(true);
    try {
      await (actor as any).submitSellerListing(
        profileName,
        profileEmail,
        title,
        description,
        propType,
        Number.parseFloat(price) || 0,
        currency,
        location,
        country,
        BigInt(Number.parseInt(bedrooms) || 0),
        BigInt(Number.parseInt(bathrooms) || 0),
        Number.parseFloat(size) || 0,
        [],
      );
      toast.success("Your listing has been submitted and is under review.");
      setTitle("");
      setPrice("");
      setCurrency("USD");
      setLocation("");
      setCountry("");
      setPropType("");
      setBedrooms("");
      setBathrooms("");
      setSize("");
      setDescription("");
      for (const img of images) URL.revokeObjectURL(img.url);
      setImages([]);
      await loadListings();
    } catch {
      toast.error("Failed to submit listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function deleteListing(id: string) {
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing removed.");
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile saved successfully.");
  }

  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative h-48 bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
        }}
        aria-label="Seller dashboard banner"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="relative z-10 container mx-auto px-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 backdrop-blur-sm flex items-center justify-center">
            <Home className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Seller Dashboard
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              Manage your property listings and profile
            </p>
          </div>
        </div>
      </div>

      <div
        className="container mx-auto px-4 py-8"
        data-ocid="seller.dashboard.panel"
      >
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-8 bg-muted border border-border rounded-xl p-1 w-full sm:w-auto">
            <TabsTrigger
              value="upload"
              className="rounded-lg"
              data-ocid="seller.upload.tab"
            >
              Upload Property
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="rounded-lg"
              data-ocid="seller.listings.tab"
            >
              My Listings
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-lg"
              data-ocid="seller.profile.tab"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Upload Property Tab */}
          <TabsContent value="upload" data-ocid="seller.upload.panel">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-2xl flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload New Property
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Fill in the details below and upload images to list your
                  property for sale.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="prop-title">
                      Property Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prop-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Luxury Sea-View Villa in Dubai"
                      className="mt-1.5"
                      required
                      data-ocid="seller.upload.title.input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="prop-price">
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="prop-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="2500000"
                        className="mt-1.5"
                        required
                        data-ocid="seller.upload.price.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prop-currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger
                          id="prop-currency"
                          className="mt-1.5"
                          data-ocid="seller.upload.currency.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCY_LIST.map((c) => (
                            <SelectItem key={c} value={c}>
                              {currencyLabel(c)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prop-location">
                        City / Location{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="prop-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Palm Jumeirah, Dubai"
                        className="mt-1.5"
                        required
                        data-ocid="seller.upload.location.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prop-country">
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="prop-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. United Arab Emirates"
                        className="mt-1.5"
                        required
                        data-ocid="seller.upload.country.input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prop-type">
                      Property Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={propType} onValueChange={setPropType}>
                      <SelectTrigger
                        id="prop-type"
                        className="mt-1.5"
                        data-ocid="seller.upload.type.select"
                      >
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "House",
                          "Apartment",
                          "Villa",
                          "Commercial",
                          "Land",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prop-beds">Bedrooms</Label>
                      <Input
                        id="prop-beds"
                        type="number"
                        min="0"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        placeholder="3"
                        className="mt-1.5"
                        data-ocid="seller.upload.bedrooms.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prop-baths">Bathrooms</Label>
                      <Input
                        id="prop-baths"
                        type="number"
                        min="0"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        placeholder="2"
                        className="mt-1.5"
                        data-ocid="seller.upload.bathrooms.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prop-size">Size (sqft)</Label>
                      <Input
                        id="prop-size"
                        type="number"
                        min="0"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="3500"
                        className="mt-1.5"
                        data-ocid="seller.upload.size.input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prop-desc">Description</Label>
                    <Textarea
                      id="prop-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the property — key features, surroundings, unique selling points..."
                      rows={5}
                      className="mt-1.5 resize-none"
                      data-ocid="seller.upload.description.textarea"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Property Images{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <ImageDropZone
                      images={images}
                      onAdd={addImages}
                      onRemove={removeImage}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-10"
                    disabled={submitting}
                    data-ocid="seller.upload.submit_button"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Listing for Review"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="listings" data-ocid="seller.listings.panel">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">My Listings</h2>
              <Badge variant="outline" className="text-sm">
                {listings.length} properties
              </Badge>
            </div>

            {loadingListings ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="seller.listings.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <div
                className="text-center py-20 border-2 border-dashed border-border rounded-xl"
                data-ocid="seller.listings.empty_state"
              >
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No listings yet. Upload your first property!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, idx) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                    data-ocid={`seller.listings.item.${idx + 1}`}
                  >
                    <div className="relative h-44 bg-muted">
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          STATUS_COLORS[listing.status] ??
                          STATUS_COLORS["Pending Review"]
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-base leading-snug mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {listing.location}, {listing.country}
                      </p>
                      <p className="font-display text-xl font-bold text-primary mb-4">
                        {listing.currency || "USD"} {listing.price}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          data-ocid={`seller.listings.edit_button.${idx + 1}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                          onClick={() => deleteListing(listing.id)}
                          data-ocid={`seller.listings.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" data-ocid="seller.profile.panel">
            <Card className="max-w-xl border-border">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-2xl">
                  Seller Profile
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Keep your contact details up to date for potential buyers.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveProfile} className="space-y-5">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="mt-1.5"
                      data-ocid="seller.profile.name.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="mt-1.5"
                      data-ocid="seller.profile.email.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="mt-1.5"
                      data-ocid="seller.profile.phone.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-country">Country</Label>
                    <Input
                      id="profile-country"
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="mt-1.5"
                      data-ocid="seller.profile.country.input"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">ID Verification</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Required to list properties on GlobalInvest
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                      Pending
                    </Badge>
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="seller.profile.save_button"
                  >
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
