import { MapPin } from "lucide-react";

interface MapEmbedProps {
  address: string;
  city: string;
  country: string;
}

export default function MapEmbed({ address, city, country }: MapEmbedProps) {
  const query = encodeURIComponent(`${address}, ${city}, ${country}`);
  const src = `https://maps.google.com/maps?q=${query}&output=embed`;

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      <iframe
        title="Property location map"
        src={src}
        width="100%"
        height="280"
        className="block"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="px-4 py-3 bg-card text-sm text-muted-foreground flex items-start gap-1.5">
        <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
        <span>
          {address}, {city}, {country}
        </span>
      </div>
    </div>
  );
}
