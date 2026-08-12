"use client";

import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DeliveryChecklistResource } from "../lib/vehicleDelivery.interface";

const SOURCE_BADGE: Record<
  string,
  { label: string; color: "blue" | "orange" | "gray" }
> = {
  reception: { label: "Recepción", color: "blue" },
  purchase_order: { label: "Accesorio OC", color: "orange" },
  manual: { label: "Manual", color: "gray" },
};

interface ShippingGuideChecklistCardProps {
  checklist?: DeliveryChecklistResource | null;
}

export function ShippingGuideChecklistCard({
  checklist,
}: ShippingGuideChecklistCardProps) {
  const checklistConfirmed = checklist?.status === "confirmed";
  const isDraft = checklist?.status === "draft";
  const hasChecklist = checklist?.id != null;
  const items = checklist?.items ?? [];
  const totalCount = items.length;
  const confirmedCount = items.filter((i) => i.is_confirmed).length;

  return (
    <GroupFormSection
      title="Checklist de Entrega"
      icon={ClipboardList}
      color="primary"
      cols={{ sm: 1, md: 1, lg: 1 }}
    >
      <div className="space-y-3">
        {/* Estado */}
        <div className="flex flex-wrap gap-1.5">
          {!hasChecklist && (
            <Badge color="gray" className="text-xs">
              Sin checklist
            </Badge>
          )}
          {isDraft && (
            <Badge color="blue" className="text-xs">
              Borrador
            </Badge>
          )}
          {checklistConfirmed && (
            <Badge color="green" icon={CheckCircle2} className="text-xs">
              Confirmado
            </Badge>
          )}
        </div>

        {/* Barra de progreso */}
        {hasChecklist && totalCount > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span className="font-medium">
                {confirmedCount}/{totalCount} conformes
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: totalCount
                    ? `${(confirmedCount / totalCount) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        )}

        {/* Items del checklist */}
        {items.length > 0 && (
          <ScrollArea className="max-h-[360px] pr-3">
            <div className="space-y-1.5 pt-1">
              {items.map((item, index) => {
                const sourceBadge =
                  SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;
                return (
                  <div
                    key={item.id ?? `item-${index}`}
                    className={cn(
                      "flex items-start gap-2 px-2.5 py-2 rounded-md border text-xs",
                      item.is_confirmed
                        ? "bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                        : "bg-background border-border",
                    )}
                  >
                    <span className="text-muted-foreground w-4 shrink-0 text-center pt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p
                        className={cn(
                          "font-medium leading-tight",
                          item.is_confirmed &&
                            "text-green-800 dark:text-green-300",
                        )}
                      >
                        {item.description}
                      </p>
                      <p className="text-muted-foreground">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                        {item.observations ? ` · ${item.observations}` : ""}
                      </p>
                    </div>
                    <Badge
                      color={sourceBadge.color}
                      className="text-xs shrink-0 whitespace-nowrap"
                    >
                      {sourceBadge.label}
                    </Badge>
                    <span
                      className={cn(
                        "flex items-center gap-1 shrink-0 font-medium",
                        item.is_confirmed
                          ? "text-green-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.is_confirmed ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Circle className="size-3.5" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Confirmado por */}
        {checklistConfirmed && checklist?.confirmed_by_name && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">Confirmado por</p>
            <p className="text-sm font-medium">
              {checklist.confirmed_by_name}
            </p>
            {checklist.confirmed_at && (
              <p className="text-xs text-muted-foreground">
                {new Date(checklist.confirmed_at).toLocaleString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
