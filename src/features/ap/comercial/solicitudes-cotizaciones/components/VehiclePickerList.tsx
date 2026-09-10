"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";

interface VehiclePickerListProps {
  vehicles: VehicleResource[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Doble clic sobre una fila (asignación rápida). */
  onQuickPick?: (id: number) => void;
}

export function VehiclePickerList({
  vehicles,
  selectedId,
  onSelect,
  onQuickPick,
}: VehiclePickerListProps) {
  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border">
      {vehicles.map((v) => {
        const selected = v.id === selectedId;
        return (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => onSelect(v.id)}
              onDoubleClick={() => onQuickPick?.(v.id)}
              className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                selected
                  ? "bg-primary/5 ring-1 ring-inset ring-primary"
                  : "hover:bg-muted/40"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                }`}
              >
                {selected && <Check className="h-2.5 w-2.5" />}
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-wide">
                    {v.vin}
                  </span>
                  {v.model?.code && (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 font-mono text-[10px]"
                    >
                      {v.model.code}
                    </Badge>
                  )}
                </span>
                <span className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {[
                    v.model?.version,
                    v.year,
                    v.vehicle_color,
                    v.engine_type,
                    v.warehouse_name,
                  ]
                    .filter(Boolean)
                    .join("  ·  ")}
                </span>
              </span>

              <span
                className="mt-0.5 inline-flex shrink-0 items-center self-start rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${v.status_color}20`,
                  color: v.status_color,
                }}
              >
                {v.vehicle_status}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
