import { Badge } from "@/components/ui/badge";
import { Bus, Footprints, GraduationCap, ShieldCheck } from "lucide-react";

// Deterministic hash from a string — returns a number 0..max
function hashScore(seed: string, salt: string, max: number): number {
  let hash = 0;
  const str = seed + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % (max + 1);
}

type ScoreLevel = "good" | "medium" | "poor";

function walkabilityLevel(score: number): ScoreLevel {
  if (score >= 70) return "good";
  if (score >= 40) return "medium";
  return "poor";
}

function transitLevel(score: number): ScoreLevel {
  if (score >= 65) return "good";
  if (score >= 35) return "medium";
  return "poor";
}

function crimeLabel(score: number): { label: string; level: ScoreLevel } {
  if (score < 35) return { label: "Low", level: "good" };
  if (score < 65) return { label: "Medium", level: "medium" };
  return { label: "High", level: "poor" };
}

function schoolGrade(score: number): { grade: string; level: ScoreLevel } {
  if (score >= 80) return { grade: "A", level: "good" };
  if (score >= 60) return { grade: "B", level: "good" };
  if (score >= 40) return { grade: "C", level: "medium" };
  return { grade: "D", level: "poor" };
}

const LEVEL_COLORS: Record<ScoreLevel, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
};

const LEVEL_BG: Record<ScoreLevel, string> = {
  good: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
  medium:
    "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
  poor: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
};

const LEVEL_ICON: Record<ScoreLevel, string> = {
  good: "text-emerald-500",
  medium: "text-amber-500",
  poor: "text-red-500",
};

export default function NeighborhoodStats({
  propertyId,
}: { propertyId: string }) {
  const walkScore = hashScore(propertyId, "walk", 100);
  const transitScore = hashScore(propertyId, "transit", 100);
  const crimeScore = hashScore(propertyId, "crime", 99);
  const schoolScore = hashScore(propertyId, "school", 100);

  const walkLvl = walkabilityLevel(walkScore);
  const transitLvl = transitLevel(transitScore);
  const { label: crimeLabel_, level: crimeLvl } = crimeLabel(crimeScore);
  const { grade, level: schoolLvl } = schoolGrade(schoolScore);

  const stats = [
    {
      icon: Footprints,
      label: "Walkability",
      value: `${walkScore}/100`,
      level: walkLvl,
      sublabel:
        walkScore >= 70
          ? "Walker's Paradise"
          : walkScore >= 40
            ? "Somewhat Walkable"
            : "Car-Dependent",
    },
    {
      icon: GraduationCap,
      label: "School Rating",
      value: grade,
      level: schoolLvl,
      sublabel:
        schoolLvl === "good"
          ? "Excellent Schools"
          : schoolLvl === "medium"
            ? "Average Schools"
            : "Below Average",
    },
    {
      icon: ShieldCheck,
      label: "Crime Index",
      value: crimeLabel_,
      level: crimeLvl,
      sublabel:
        crimeLvl === "good"
          ? "Very Safe Area"
          : crimeLvl === "medium"
            ? "Average Safety"
            : "Higher Crime",
    },
    {
      icon: Bus,
      label: "Transit Score",
      value: `${transitScore}/100`,
      level: transitLvl,
      sublabel:
        transitScore >= 65
          ? "Excellent Transit"
          : transitScore >= 35
            ? "Some Transit"
            : "Minimal Transit",
    },
  ];

  return (
    <section
      className="mb-8"
      aria-label="Neighborhood statistics"
      data-ocid="neighborhood.section"
    >
      <h2 className="font-display text-xl font-semibold mb-4">
        Neighborhood Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 border text-center transition-shadow hover:shadow-md ${LEVEL_BG[stat.level]}`}
          >
            <stat.icon
              className={`w-6 h-6 mx-auto mb-2 ${LEVEL_ICON[stat.level]}`}
            />
            <p className={`text-xl font-bold ${LEVEL_COLORS[stat.level]}`}>
              {stat.value}
            </p>
            <p className="text-xs font-semibold text-foreground mt-0.5">
              {stat.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">
              {stat.sublabel}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-right">
        <Badge variant="outline" className="text-[10px] font-normal">
          Estimated data
        </Badge>
      </p>
    </section>
  );
}
