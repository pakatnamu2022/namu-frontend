"use client";

import { Progress } from "@/components/ui/progress";
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
              className="flex flex-col items-end justify-center px-4 first:pl-0 last:pr-0 gap-0.5"
            >
              <span className="text-sm font-semibold tabular-nums leading-none">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mt-0.5">
                {stat.label}
              </span>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="w-16 h-[3px] mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
