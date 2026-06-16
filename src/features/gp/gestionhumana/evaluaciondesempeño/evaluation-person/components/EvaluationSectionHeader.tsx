"use client";

import { cn } from "@/lib/utils";

interface StatItem {
  value: string;
  label: string;
  progress?: number;
}

interface EvaluationSectionHeaderProps {
  title: string;
  subtitle: string;
  stats?: StatItem[];
  showProgress?: boolean;
  className?: string;
}

function progressHex(pct: number) {
  if (pct >= 80) return "#10b981"; // emerald
  if (pct >= 50) return "#f59e0b"; // amber
  return "#f43f5e";                // rose
}

export default function EvaluationSectionHeader({
  title,
  subtitle,
  stats = [],
  showProgress = true,
  className,
}: EvaluationSectionHeaderProps) {
  const visibleStats = showProgress ? stats : stats.filter((s) => s.progress === undefined);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 px-4 py-3 rounded-xl border bg-background shadow-xs",
        className,
      )}
    >
      {/* Título + subtítulo */}
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight leading-tight truncate">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
      </div>

      {/* Stats */}
      {visibleStats.length > 0 && (
        <div className="flex items-stretch divide-x shrink-0">
          {visibleStats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col justify-center px-5 first:pl-0 last:pr-0 gap-1 min-w-[90px]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
                  {stat.label}
                </span>
              </div>
              {stat.progress !== undefined && (
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stat.progress, 100)}%`,
                      backgroundColor: progressHex(stat.progress),
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
