import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export default function ImageGallery({
  images,
  alt = "Property",
}: ImageGalleryProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")
        setActiveImg((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setActiveImg((i) => (i + 1) % images.length);
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden aspect-[16/9] bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main image — 16:9 */}
      <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-black mb-3 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={images[activeImg]}
            alt={`${alt} — ${activeImg + 1} of ${images.length}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          aria-label="View fullscreen"
          data-ocid="gallery.fullscreen.button"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveImg((activeImg - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label="Previous"
              data-ocid="gallery.prev.button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveImg((activeImg + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label="Next"
              data-ocid="gallery.next.button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {activeImg + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              type="button"
              key={src}
              onClick={() => setActiveImg(i)}
              className={`rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                activeImg === i
                  ? "border-primary scale-105 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
              style={{ width: 80, height: 54 }}
              aria-label={`View ${alt} ${i + 1}`}
              data-ocid={`gallery.thumbnail.${i + 1}`}
            >
              <img
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="gallery.lightbox.modal"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2.5 hover:bg-white/20 transition-colors"
              aria-label="Close"
              data-ocid="gallery.lightbox.close.button"
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImg(
                      (activeImg - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors"
                  aria-label="Previous"
                  data-ocid="gallery.lightbox.prev.button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((activeImg + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors"
                  aria-label="Next"
                  data-ocid="gallery.lightbox.next.button"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img
              key={activeImg}
              src={images[activeImg]}
              alt={`${alt} ${activeImg + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {activeImg + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
