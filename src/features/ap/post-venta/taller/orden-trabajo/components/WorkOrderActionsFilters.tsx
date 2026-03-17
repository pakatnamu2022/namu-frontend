"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { FileText, Files, ReceiptText } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type WorkOrderCajaView = "OT" | "PENDING" | "INVOICED";

interface WorkOrderActionsFiltersProps {
  activeView: WorkOrderCajaView;
  onViewChange: (view: WorkOrderCajaView) => void;
}

const VIEW_CONFIG: Record<
  WorkOrderCajaView,
  {
    label: string;
    shortLabel: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  OT: {
    label: "OT Individual",
    shortLabel: "Individual",
    description: "Se factura 1 OT en 1 factura.",
    icon: FileText,
  },
  PENDING: {
    label: "Por Facturar (Masiva)",
    shortLabel: "Por Facturar",
    description:
      "OT pendientes para facturar en una sola factura masiva (2 o más OT).",
    icon: Files,
  },
  INVOICED: {
    label: "Facturadas (Masiva)",
    shortLabel: "Facturadas",
    description: "OT ya facturadas en una factura masiva (2 o más OT).",
    icon: ReceiptText,
  },
};

export default function WorkOrderActionsFilters({
  activeView,
  onViewChange,
}: WorkOrderActionsFiltersProps) {
  const activeConfig = VIEW_CONFIG[activeView];

  return (
    <div className="flex flex-col gap-2 items-end w-full">
      <ButtonGroup>
        {(Object.keys(VIEW_CONFIG) as WorkOrderCajaView[]).map((view) => {
          const option = VIEW_CONFIG[view];
          const Icon = option.icon;
          const isActive = activeView === view;

          return (
            <Button
              key={view}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onViewChange(view)}
              className="gap-1.5"
              aria-pressed={isActive}
              tooltip={option.label}
            >
              <Icon className="size-4" />
              {option.shortLabel}
            </Button>
          );
        })}
      </ButtonGroup>

      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
        <p>
          <strong>{activeConfig.label}:</strong> {activeConfig.description}
        </p>
      </div>
    </div>
  );
}
