import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Download, FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const SYSTEM_FIELDS = [
  "title",
  "description",
  "price",
  "currency",
  "bedrooms",
  "bathrooms",
  "area_sqft",
  "property_type",
  "city",
  "country",
  "address",
  "agent_email",
  "-- skip --",
];

const MOCK_CSV_COLUMNS = [
  "Property Name",
  "Cost (USD)",
  "Beds",
  "Baths",
  "Location",
  "Description",
  "Agent",
  "Listing Type",
];

const DEFAULT_MAPPING: Record<string, string> = {
  "Property Name": "title",
  "Cost (USD)": "price",
  Beds: "bedrooms",
  Baths: "bathrooms",
  Location: "city",
  Description: "description",
  Agent: "agent_email",
  "Listing Type": "property_type",
};

const MOCK_ERRORS = [
  { row: 4, field: "price", message: 'Invalid numeric value: "N/A"' },
  { row: 11, field: "bedrooms", message: "Value out of range: 99 (max: 20)" },
];

export default function BulkImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapping, setMapping] =
    useState<Record<string, string>>(DEFAULT_MAPPING);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) {
      setFile(dropped);
    } else {
      toast.error("Please upload a CSV file.");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  function handleImport() {
    toast.success(`Importing ${file?.name ?? "CSV"}... (mock)`);
  }

  function handleExport() {
    const csv =
      "title,price,bedrooms,bathrooms,city,country,property_type\n" +
      "Luxury Penthouse Lagos,450000000,4,3,Lagos,Nigeria,apartment\n" +
      "Modern Flat London,1200000,3,2,London,UK,apartment\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "listings-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Listings exported as CSV.");
  }

  return (
    <section aria-labelledby="bulk-import-heading">
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                id="bulk-import-heading"
                className="font-display font-semibold text-lg flex items-center gap-2"
              >
                <Upload className="w-5 h-5 text-primary" />
                Bulk Import / Export Listings
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a CSV to bulk-import listings, or export all existing
                listings.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 shrink-0"
              data-ocid="bulk.export.button"
            >
              <Download className="w-4 h-4" /> Export All Listings (CSV)
            </Button>
          </div>

          {/* Drop zone */}
          {!file ? (
            <label
              htmlFor="csv-upload"
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              data-ocid="bulk.dropzone"
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileInput}
                data-ocid="bulk.upload.button"
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-sm">
                Drop CSV here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files only
              </p>
            </label>
          ) : (
            <div className="space-y-5">
              {/* File preview */}
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 hover:bg-muted rounded"
                  data-ocid="bulk.remove.button"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Field mapping */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Field Mapping</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        CSV Column
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        → System Field
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_CSV_COLUMNS.map((col) => (
                      <TableRow key={col} className="hover:bg-accent/30">
                        <TableCell className="font-mono text-sm">
                          {col}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping[col] ?? "-- skip --"}
                            onValueChange={(v) =>
                              setMapping((prev) => ({ ...prev, [col]: v }))
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-48 text-xs"
                              data-ocid="bulk.field.select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SYSTEM_FIELDS.map((f) => (
                                <SelectItem
                                  key={f}
                                  value={f}
                                  className="text-xs"
                                >
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Validation errors */}
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2"
                data-ocid="bulk.error_state"
              >
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {MOCK_ERRORS.length}{" "}
                  Validation Errors Found
                </p>
                {MOCK_ERRORS.map((err) => (
                  <div
                    key={`${err.row}-${err.field}`}
                    className="text-xs text-red-600 pl-5"
                  >
                    Row {err.row}, field{" "}
                    <code className="font-mono bg-red-100 px-1 rounded">
                      {err.field}
                    </code>
                    : {err.message}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleImport}
                className="bg-primary text-primary-foreground"
                data-ocid="bulk.import.button"
              >
                <Upload className="w-4 h-4 mr-2" /> Import Listings
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
