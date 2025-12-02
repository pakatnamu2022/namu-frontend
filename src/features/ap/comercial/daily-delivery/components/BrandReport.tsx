"use client";

import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandReportSection, BrandReportItem } from "../lib/daily-delivery.interface";

interface BrandReportProps {
  brandReport: BrandReportSection[];
}

const LEVEL_STYLES = {
  group: {
    textColor: "text-purple-700",
    fontSize: "text-base",
    fontWeight: "font-bold",
    bgColor: "bg-purple-50",
  },
  sede: {
    textColor: "text-blue-700",
    fontSize: "text-sm",
    fontWeight: "font-semibold",
    bgColor: "bg-blue-50/30",
  },
  brand: {
    textColor: "text-slate-700",
    fontSize: "text-sm",
    fontWeight: "font-medium",
    bgColor: "bg-white",
  },
};

function organizeItems(items: BrandReportItem[]) {
  const result: Array<{ type: 'group' | 'sede'; item: BrandReportItem; brands?: BrandReportItem[] }> = [];
  let currentSede: { type: 'sede'; item: BrandReportItem; brands: BrandReportItem[] } | null = null;

  for (const item of items) {
    if (item.level === "group") {
      result.push({ type: 'group', item });
    } else if (item.level === "sede") {
      if (currentSede) {
        result.push(currentSede);
      }
      currentSede = { type: 'sede', item, brands: [] };
    } else if (item.level === "brand" && currentSede) {
      currentSede.brands.push(item);
    }
  }

  if (currentSede) {
    result.push(currentSede);
  }

  return result;
}

export default function BrandReport({ brandReport }: BrandReportProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => {
    return new Set(brandReport.map((_, index) => index));
  });

  const [expandedSedes, setExpandedSedes] = useState<Set<string>>(() => {
    const allSedeKeys = new Set<string>();
    brandReport.forEach((section, sectionIndex) => {
      const organized = organizeItems(section.items);
      organized.forEach((entry, entryIndex) => {
        if (entry.type === "sede") {
          allSedeKeys.add(`${sectionIndex}-${entryIndex}`);
        }
      });
    });
    return allSedeKeys;
  });

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSede = (key: string) => {
    setExpandedSedes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(brandReport.map((_, index) => index)));
    const allSedeKeys = new Set<string>();
    brandReport.forEach((section, sectionIndex) => {
      const organized = organizeItems(section.items);
      organized.forEach((entry, entryIndex) => {
        if (entry.type === "sede") {
          allSedeKeys.add(`${sectionIndex}-${entryIndex}`);
        }
      });
    });
    setExpandedSedes(allSedeKeys);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
    setExpandedSedes(new Set());
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Reporte por Marcas</h3>
        <div className="flex gap-2">
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

      {/* Header de columnas */}
      <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 px-3 py-2 border-b bg-muted/30 sticky top-0">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Marca / Sede
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Compras
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Entregas
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Facturadas
          </span>
        </div>
      </div>

      <div className="p-2">
        <div className="space-y-4">
          {brandReport.map((section, sectionIndex) => {
            const organized = organizeItems(section.items);
            const isSectionExpanded = expandedSections.has(sectionIndex);

            return (
              <div key={sectionIndex} className="space-y-1">
                {/* Título de sección con accordion */}
                <div
                  className="px-3 py-2 bg-slate-100 rounded-md flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  {isSectionExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-600 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                  )}
                  <h4 className="text-sm font-bold text-slate-800">
                    {section.title}
                  </h4>
                </div>

                {/* Items organizados - Solo mostrar si la sección está expandida */}
                {isSectionExpanded && organized.map((entry, entryIndex) => {
                  if (entry.type === "group") {
                    return (
                      <div
                        key={`group-${entryIndex}`}
                        className={`grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center py-2 px-3 rounded-md ${LEVEL_STYLES.group.bgColor}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate ${LEVEL_STYLES.group.textColor} ${LEVEL_STYLES.group.fontSize} ${LEVEL_STYLES.group.fontWeight}`}
                          >
                            {entry.item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums">
                            {entry.item.compras}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums">
                            {entry.item.entregas}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600 tabular-nums">
                            {entry.item.facturadas}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Sede con sus marcas
                  const sedeKey = `${sectionIndex}-${entryIndex}`;
                  const isSedeExpanded = expandedSedes.has(sedeKey);

                  return (
                    <div key={`sede-${entryIndex}`} className="space-y-1">
                      {/* Sede con accordion */}
                      <div
                        onClick={() => toggleSede(sedeKey)}
                        className={`grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center py-2 px-3 rounded-md ml-4 cursor-pointer hover:bg-blue-100/50 transition-colors ${LEVEL_STYLES.sede.bgColor}`}
                      >
                        <div className="flex items-center gap-2">
                          {isSedeExpanded ? (
                            <ChevronDown className="h-3 w-3 text-blue-600 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-blue-600 shrink-0" />
                          )}
                          <span
                            className={`truncate ${LEVEL_STYLES.sede.textColor} ${LEVEL_STYLES.sede.fontSize} ${LEVEL_STYLES.sede.fontWeight}`}
                          >
                            {entry.item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums">
                            {entry.item.compras}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums">
                            {entry.item.entregas}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600 tabular-nums">
                            {entry.item.facturadas}
                          </div>
                        </div>
                      </div>

                      {/* Marcas de la sede - Solo mostrar si la sede está expandida */}
                      {isSedeExpanded && entry.brands && entry.brands.map((brand, brandIndex) => (
                        <div
                          key={`brand-${entryIndex}-${brandIndex}`}
                          className={`grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center py-1.5 px-3 rounded-md ml-8 hover:bg-accent/30 transition-all ${LEVEL_STYLES.brand.bgColor}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`truncate ${LEVEL_STYLES.brand.textColor} ${LEVEL_STYLES.brand.fontSize} ${LEVEL_STYLES.brand.fontWeight}`}
                            >
                              {brand.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200 shrink-0"
                            >
                              Marca
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold tabular-nums">
                              {brand.compras}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold tabular-nums">
                              {brand.entregas}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-emerald-600 tabular-nums">
                              {brand.facturadas}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
