"use client";

import { cn } from "@/lib/utils";

export const TAILWIND_COLORS = [
  { name: "slate", hex: "#64748b" },
  { name: "gray", hex: "#6b7280" },
  { name: "zinc", hex: "#71717a" },
  { name: "neutral", hex: "#737373" },
  { name: "stone", hex: "#78716c" },
  { name: "red", hex: "#ef4444" },
  { name: "orange", hex: "#f97316" },
  { name: "amber", hex: "#f59e0b" },
  { name: "yellow", hex: "#eab308" },
  { name: "lime", hex: "#84cc16" },
  { name: "green", hex: "#22c55e" },
  { name: "emerald", hex: "#10b981" },
  { name: "teal", hex: "#14b8a6" },
  { name: "cyan", hex: "#06b6d4" },
  { name: "sky", hex: "#0ea5e9" },
  { name: "blue", hex: "#3b82f6" },
  { name: "indigo", hex: "#6366f1" },
  { name: "violet", hex: "#8b5cf6" },
  { name: "purple", hex: "#a855f7" },
  { name: "fuchsia", hex: "#d946ef" },
  { name: "pink", hex: "#ec4899" },
  { name: "rose", hex: "#f43f5e" },
] as const;

export type TailwindColorName = (typeof TAILWIND_COLORS)[number]["name"];

export const getTailwindHex = (name: TailwindColorName | string): string =>
  TAILWIND_COLORS.find((c) => c.name === name)?.hex ?? "#6b7280";

interface TailwindColorPickerProps {
  value?: string;
  onChange?: (name: TailwindColorName) => void;
  className?: string;
}

export const TailwindColorPicker = ({
  value,
  onChange,
  className,
}: TailwindColorPickerProps) => {
  return (
    <div className={cn("grid grid-cols-6 gap-1.5", className)}>
      {TAILWIND_COLORS.map(({ name, hex }) => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => onChange?.(name)}
          className={cn(
            "size-7 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === name && "ring-2 ring-offset-2 ring-foreground",
          )}
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  );
};
