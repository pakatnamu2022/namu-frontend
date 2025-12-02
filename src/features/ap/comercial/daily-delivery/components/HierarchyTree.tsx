"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DailyDeliveryHierarchyNode } from "../lib/daily-delivery.interface";

interface HierarchyTreeProps {
  hierarchy: DailyDeliveryHierarchyNode[];
}

interface HierarchyNodeProps {
  node: DailyDeliveryHierarchyNode;
  level?: number;
  parentNodes?: DailyDeliveryHierarchyNode[];
}

const POSITION_STYLES = {
  gerente: {
    label: "Gerente",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
    textColor: "text-indigo-700",
    fontSize: "text-base",
    fontWeight: "font-semibold",
  },
  jefe: {
    label: "Jefe",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-700",
    fontSize: "text-sm",
    fontWeight: "font-semibold",
  },
  asesor: {
    label: "Asesor",
    className: "bg-green-100 text-green-700 border-green-200",
    textColor: "text-slate-700",
    fontSize: "text-sm",
    fontWeight: "font-medium",
  },
};

function HierarchyNode({ node, level = 0 }: HierarchyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const isManager = node.level === "gerente";

  return (
    <div>
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`group grid grid-cols-[auto_1fr_120px_300px_100px_100px] gap-4 items-center py-2 px-3 rounded-md hover:bg-accent/50 transition-all cursor-pointer ${
          level > 0 ? "ml-6" : ""
        } ${isManager ? "font-medium" : ""}`}
      >
        {/* Columna 1: Chevron + Nombre */}
        <div className="flex items-center gap-2 min-w-0 col-span-2">
          <div className="w-4 flex items-center justify-center shrink-0">
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ))}
          </div>

          <span
            className={`truncate ${POSITION_STYLES[node.level].textColor} ${
              POSITION_STYLES[node.level].fontSize
            } ${POSITION_STYLES[node.level].fontWeight}`}
          >
            {node.name}
          </span>

          {node.brand_group && (
            <Badge
              variant="outline"
              className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-100 text-indigo-700 border-indigo-200 shrink-0"
            >
              {node.brand_group}
            </Badge>
          )}

          {node.article_class && (
            <Badge
              variant="outline"
              className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-700 border-slate-200 shrink-0"
            >
              {node.article_class}
            </Badge>
          )}
        </div>

        {/* Columna 2: Cargo */}
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium px-2 py-0.5 ${
              POSITION_STYLES[node.level].className
            }`}
          >
            {POSITION_STYLES[node.level].label}
          </Badge>
        </div>

        {/* Columna 3: Marcas */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">
          {node.brands && node.brands.length > 0 ? (
            node.brands.map((brand) => (
              <Badge
                key={brand}
                variant="outline"
                className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200 shrink-0"
              >
                {brand}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>

        {/* Columna 4: Entregas */}
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums">{node.entregas}</div>
        </div>

        {/* Columna 5: Facturadas */}
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-600 tabular-nums">
            {node.facturadas}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <HierarchyNode
              key={child.id}
              node={child}
              level={level + 1}
              parentNodes={node.children || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyTree({ hierarchy }: HierarchyTreeProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">
          Desempeño por Gerente y Asesor
        </h3>
      </div>

      {/* Header de columnas */}
      <div className="grid grid-cols-[auto_1fr_120px_300px_100px_100px] gap-4 px-3 py-2 border-b bg-muted/30">
        <div className="col-span-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Nombre
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Cargo
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Marcas
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
        {hierarchy.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No hay datos disponibles para la fecha seleccionada
          </div>
        ) : (
          hierarchy.map((node) => <HierarchyNode key={node.id} node={node} />)
        )}
      </div>
    </div>
  );
}
