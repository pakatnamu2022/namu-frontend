"use client";

import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PurchasesReport as PurchasesReportType } from "../lib/daily-delivery.interface";

interface PurchasesReportProps {
  purchasesReport: PurchasesReportType;
}

type ViewMode = "brand" | "sede";

export default function PurchasesReport({
  purchasesReport,
}: PurchasesReportProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("brand");

  const groups =
    viewMode === "brand"
      ? purchasesReport.by_brand.map((g) => ({
          key: `brand-${g.brand_id}`,
          title: g.brand_name,
          total: g.total_compras,
          children: g.sedes.map((s) => ({
            key: `sede-${s.sede_id}`,
            name: s.sede_name,
            compras: s.compras,
          })),
        }))
      : purchasesReport.by_sede.map((g) => ({
          key: `sede-${g.sede_id}`,
          title: g.sede_name,
          total: g.total_compras,
          children: g.brands.map((b) => ({
            key: `brand-${b.brand_id}`,
            name: b.brand_name,
            compras: b.compras,
          })),
        }));

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.key))
  );

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => setExpandedGroups(new Set(groups.map((g) => g.key)));
  const collapseAll = () => setExpandedGroups(new Set());

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const newGroups =
      mode === "brand"
        ? purchasesReport.by_brand.map((g) => `brand-${g.brand_id}`)
        : purchasesReport.by_sede.map((g) => `sede-${g.sede_id}`);
    setExpandedGroups(new Set(newGroups));
  };

  const childLabel = viewMode === "brand" ? "Sede" : "Marca";

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Reporte de Compras</h3>
        <div className="flex gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => handleViewModeChange("brand")}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors",
                viewMode === "brand"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-muted/50"
              )}
            >
              Por Marca
            </button>
            <button
              onClick={() => handleViewModeChange("sede")}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors",
                viewMode === "sede"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-muted/50"
              )}
            >
              Por Sede
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-7 text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Expandir Todo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-7 text-xs"
          >
            <Minimize2 className="h-3 w-3 mr-1" />
            Contraer Todo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_120px] gap-4 px-3 py-2 border-b bg-muted/30 sticky top-0">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {viewMode === "brand" ? "Marca / Sede" : "Sede / Marca"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Compras
          </span>
        </div>
      </div>

      <div className="p-2">
        <div className="space-y-1">
          {groups.map((group) => {
            const isExpanded = expandedGroups.has(group.key);

            return (
              <div key={group.key} className="space-y-1">
                <div
                  className="cursor-pointer hover:bg-slate-200 transition-colors rounded-md"
                  onClick={() => toggleGroup(group.key)}
                >
                  <div className="px-3 py-2 bg-slate-100 rounded-md flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-600 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-slate-800 flex-1">
                      {group.title}
                    </h4>
                    <div className="text-xs font-semibold text-slate-600">
                      <span className="text-muted-foreground">Compras: </span>
                      {group.total}
                    </div>
                  </div>
                </div>

                {isExpanded &&
                  group.children.map((child) => (
                    <div
                      key={child.key}
                      className="grid grid-cols-[1fr_120px] gap-4 items-center py-1.5 px-3 rounded-md ml-4 hover:bg-accent/30 transition-all bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-700">
                          {child.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200 shrink-0"
                        >
                          {childLabel}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums">
                          {child.compras}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
