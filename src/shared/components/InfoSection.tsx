import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoField {
  label: string;
  value: React.ReactNode;
  /** Ocupa las 2 columnas del grid */
  fullWidth?: boolean;
}

interface InfoSectionProps {
  title: string;
  icon?: LucideIcon;
  fields: InfoField[];
  /** Número de columnas del grid (default: 2) */
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const colsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function InfoSection({
  title,
  icon: Icon,
  fields,
  columns = 2,
  className,
}: InfoSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        {title}
      </h3>
      <div
        className={cn(
          "grid gap-4 bg-muted/30 p-4 rounded-lg",
          colsClass[columns],
        )}
      >
        {fields.map((field, i) => (
          <div key={i} className={field.fullWidth ? "col-span-2" : undefined}>
            <p className="text-xs text-muted-foreground">{field.label}</p>
            {typeof field.value === "string" ||
            typeof field.value === "number" ||
            field.value === null ||
            field.value === undefined ? (
              <p className="text-sm font-medium">{field.value ?? "N/A"}</p>
            ) : (
              field.value
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
