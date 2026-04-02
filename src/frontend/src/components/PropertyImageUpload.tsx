import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useUploadPropertyImage } from "../hooks/useQueries";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported format. Use JPG, PNG, or WebP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`;
  }
  return null;
}

interface UploadingFile {
  name: string;
  progress: number;
  error?: string;
}

interface PropertyImageUploadProps {
  propertyId: bigint;
  existingImages: ExternalBlob[];
  onImagesUpdated?: () => void;
}

export function PropertyImageUpload({
  propertyId,
  existingImages,
  onImagesUpdated,
}: PropertyImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Record<string, UploadingFile>
  >({});
  // Local ordered/filtered copy of existingImages for delete + reorder
  const [localImages, setLocalImages] =
    useState<ExternalBlob[]>(existingImages);
  const uploadImage = useUploadPropertyImage();

  // Sync when existingImages prop changes (e.g. after upload)
  // Use a key prop on the parent to reset, or detect length change
  const prevCountRef = useRef(existingImages.length);
  if (existingImages.length !== prevCountRef.current) {
    prevCountRef.current = existingImages.length;
    setLocalImages(existingImages);
  }

  function handleDelete(idx: number) {
    setLocalImages((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Image removed.");
  }

  function handleMoveLeft(idx: number) {
    if (idx === 0) return;
    setLocalImages((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function handleMoveRight(idx: number) {
    setLocalImages((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  async function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        continue;
      }

      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles((prev) => ({
        ...prev,
        [fileKey]: { name: file.name, progress: 0 },
      }));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
          (percentage) => {
            setUploadingFiles((prev) => ({
              ...prev,
              [fileKey]: { name: file.name, progress: percentage },
            }));
          },
        );

        await uploadImage.mutateAsync({ propertyId, blob });

        toast.success(`"${file.name}" uploaded successfully.`);
        onImagesUpdated?.();
      } catch {
        setUploadingFiles((prev) => ({
          ...prev,
          [fileKey]: {
            name: file.name,
            progress: 0,
            error: "Upload failed. Try again.",
          },
        }));
        toast.error(`Failed to upload "${file.name}".`);
      } finally {
        setTimeout(() => {
          setUploadingFiles((prev) => {
            const updated = { ...prev };
            delete updated[fileKey];
            return updated;
          });
        }, 1500);
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }

  const activeUploads = Object.values(uploadingFiles);

  return (
    <div className="space-y-4">
      {/* Existing images with delete + reorder */}
      {localImages.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Uploaded Images ({localImages.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {localImages.map((img, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: images have no stable id
                key={idx}
                className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted group"
              >
                <img
                  src={img.getDirectURL()}
                  alt={`View ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Remove image"
                  data-ocid={`image-upload.delete_button.${idx + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Reorder buttons */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(idx)}
                    disabled={idx === 0}
                    className="w-5 h-5 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-background transition-colors shadow-sm"
                    title="Move left"
                    data-ocid={`image-upload.move-left.button.${idx + 1}`}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRight(idx)}
                    disabled={idx === localImages.length - 1}
                    className="w-5 h-5 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-background transition-colors shadow-sm"
                    title="Move right"
                    data-ocid={`image-upload.move-right.button.${idx + 1}`}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <button
        type="button"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/60 hover:bg-muted/50"
        }`}
        data-ocid="image-upload.dropzone"
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">
          Drop images here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WebP — max {MAX_FILE_SIZE_MB}MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          data-ocid="image-upload.file-input"
        />
      </button>

      {/* Upload progress */}
      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {activeUploads.map((f, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: transient list with no stable id
            <div key={idx} className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate max-w-[200px]">{f.name}</span>
                {f.error ? (
                  <span className="text-xs text-destructive">{f.error}</span>
                ) : f.progress === 100 ? (
                  <span className="text-xs text-green-600">Done</span>
                ) : (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                )}
              </div>
              {!f.error && <Progress value={f.progress} className="h-1" />}
            </div>
          ))}
        </div>
      )}

      {localImages.length === 0 && activeUploads.length === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ImageIcon className="w-4 h-4" />
          <span>No images uploaded yet</span>
        </div>
      )}
    </div>
  );
}
