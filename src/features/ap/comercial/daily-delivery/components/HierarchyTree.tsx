"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DailyDeliveryHierarchyNode } from "../lib/daily-delivery.interface";

interface HierarchyTreeProps {
  hierarchy: DailyDeliveryHierarchyNode[];
}

interface HierarchyNodeProps {
  node: DailyDeliveryHierarchyNode;
  level?: number;
}

function HierarchyNode({ node, level = 0 }: HierarchyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isManager = node.level === "gerente";

  return (
    <div>
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`group flex items-center gap-3 py-1.5 px-3 rounded-md hover:bg-accent/50 transition-all cursor-pointer ${
          level > 0 ? "ml-6" : ""
        } ${isManager ? "font-medium" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-4 flex items-center justify-center shrink-0">
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )
            )}
          </div>

          <span className={`text-sm truncate ${isManager ? "font-semibold" : ""}`}>
            {node.name}
          </span>

          {isManager && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
              GERENTE
            </span>
          )}
        </div>

        <div className="flex gap-8 items-center shrink-0">
          <div className="text-right w-14">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Entregas</div>
            <div className="text-sm font-bold tabular-nums">{node.entregas}</div>
          </div>
          <div className="text-right w-24">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Facturación</div>
            <div className="text-xs font-semibold text-emerald-600 tabular-nums">
              {formatCurrency(node.facturacion)}
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <HierarchyNode key={child.id} node={child} level={level + 1} />
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
        <h3 className="text-sm font-semibold">Desempeño por Gerente y Asesor</h3>
      </div>
      <div className="p-2">
        {hierarchy.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No hay datos disponibles para la fecha seleccionada
          </div>
        ) : (
          hierarchy.map((node) => (
            <HierarchyNode key={node.id} node={node} />
          ))
        )}
      </div>
    </div>
  );
}
