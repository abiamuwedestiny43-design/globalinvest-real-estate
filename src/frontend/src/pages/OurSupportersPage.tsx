import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { GlobalBusinessLeaders } from "../components/GlobalBusinessLeaders";
import { IndiaBusinessLeaders } from "../components/IndiaBusinessLeaders";
import { MiddleEastBusinessLeaders } from "../components/MiddleEastBusinessLeaders";
import { QatariBusinessLeaders } from "../components/QatariBusinessLeaders";

type Region = "all" | "global" | "india" | "middle_east" | "qatar" | "asia";

const REGION_TABS: { id: Region; label: string }[] = [
  { id: "all", label: "All Regions" },
  { id: "global", label: "Global" },
  { id: "india", label: "India" },
  { id: "middle_east", label: "Middle East" },
  { id: "qatar", label: "Qatar" },
  { id: "asia", label: "Asia" },
];

const STATS = [
  { value: "50+", label: "Business Leaders" },
  { value: "5", label: "Regions" },
  { value: "$1T+", label: "Combined Net Worth" },
];

export default function OurSupportersPage() {
  const [activeRegion, setActiveRegion] = useState<Region>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  // When searching, show all regions. When filtering by region, show only that section.
  const showGlobal =
    isSearching || activeRegion === "all" || activeRegion === "global";
  const showIndia =
    isSearching || activeRegion === "all" || activeRegion === "india";
  const showMiddleEast =
    isSearching || activeRegion === "all" || activeRegion === "middle_east";
  const showQatar =
    isSearching || activeRegion === "all" || activeRegion === "qatar";
  // Asia tab currently shows all since AsiaBusinessLeaders isn't a separate component yet
  const showAsiaBanner =
    (isSearching || activeRegion === "asia") &&
    !showGlobal &&
    !showIndia &&
    !showMiddleEast &&
    !showQatar;

  return (
    <div id="main-content" data-ocid="supporters.page">
      {/* Hero */}
      <section
        className="relative py-24 px-4 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.06 240) 0%, oklch(0.28 0.08 200) 50%, oklch(0.20 0.05 260) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, oklch(0.7 0.18 185) 0%, transparent 60%), radial-gradient(circle at 70% 50%, oklch(0.6 0.15 200) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-white/80 border border-white/20">
            Global Endorsements
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Our Global Supporters
          </h1>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-4">
            World-class business leaders and industry titans who believe in
            GlobalInvest&apos;s vision &mdash; connecting investors with premium
            real estate opportunities across every continent.
          </p>
          <p className="text-base text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">
            From technology titans to real estate moguls, our supporters span
            every major industry &mdash; technology, infrastructure, energy,
            retail, media, and luxury goods &mdash; united by a shared belief in
            the power of global real estate investment.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm"
              >
                <span className="font-display font-bold text-2xl text-white">
                  {stat.value}
                </span>
                <span className="text-white/60 text-xs mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div
        className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        data-ocid="supporters.filter.panel"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search input */}
            <div className="relative flex-shrink-0 w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or company…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm"
                data-ocid="supporters.search_input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region tabs */}
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Filter by region"
            >
              {REGION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeRegion === tab.id}
                  onClick={() => {
                    setActiveRegion(tab.id);
                    setSearchQuery("");
                  }}
                  data-ocid={"supporters.region.tab"}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeRegion === tab.id && !isSearching
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search notice */}
          <AnimatePresence>
            {isSearching && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-primary font-medium mt-2 overflow-hidden"
              >
                Searching all regions for:{" "}
                <span className="italic">&ldquo;{searchQuery}&rdquo;</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sections — shown/hidden by region filter */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isSearching ? "search" : activeRegion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeRegion === "asia" && !isSearching ? (
            <div className="container mx-auto px-4 py-20 text-center">
              <p className="text-muted-foreground text-lg">
                Asia region leaders are featured in the{" "}
                <a
                  href="/about"
                  className="text-primary underline underline-offset-4"
                >
                  Global Leaders
                </a>{" "}
                and Global sections above.
              </p>
            </div>
          ) : (
            <>
              {showGlobal && (
                <section data-ocid="supporters.global.section">
                  <GlobalBusinessLeaders />
                </section>
              )}

              {showGlobal && showIndia && <hr className="border-border mx-8" />}

              {showIndia && (
                <section data-ocid="supporters.india.section">
                  <IndiaBusinessLeaders />
                </section>
              )}

              {showIndia && showMiddleEast && (
                <hr className="border-border mx-8" />
              )}

              {showMiddleEast && (
                <section data-ocid="supporters.middle_east.section">
                  <MiddleEastBusinessLeaders />
                </section>
              )}

              {showMiddleEast && showQatar && (
                <hr className="border-border mx-8" />
              )}

              {showQatar && (
                <section data-ocid="supporters.qatar.section">
                  <QatariBusinessLeaders />
                </section>
              )}

              {showAsiaBanner && (
                <div className="container mx-auto px-4 py-20 text-center">
                  <p className="text-muted-foreground text-lg">
                    Asia region content coming soon.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
