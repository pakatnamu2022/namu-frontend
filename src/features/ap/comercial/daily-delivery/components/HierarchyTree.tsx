"use client";

import {
  ChevronDown,
  ChevronRight,
  ListTree,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, createContext, useContext, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DailyDeliveryHierarchyNode,
  DeliveriesDetail,
} from "../lib/daily-delivery.interface";

const DEFAULT_POSITION_STYLE = {
  label: "",
  className: "bg-slate-100 text-slate-700 border-slate-200",
  textColor: "text-slate-700",
  fontSize: "text-sm",
  fontWeight: "font-medium",
};

interface HierarchyTreeProps {
  hierarchy: DailyDeliveryHierarchyNode[];
  entregasDetalle?: DeliveriesDetail;
}

interface HierarchyNodeProps {
  node: DailyDeliveryHierarchyNode;
  level?: number;
  parentNodes?: DailyDeliveryHierarchyNode[];
}

interface ExpandContextType {
  expandedNodes: Set<number | null>;
  toggleNode: (id: number | null) => void;
  entregasDetalle: DeliveriesDetail;
}

const ExpandContext = createContext<ExpandContextType>({
  expandedNodes: new Set(),
  toggleNode: () => {},
  entregasDetalle: {},
});

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  delivered: "Entregado",
  completed: "Entregado",
  pending: "Pendiente",
  cancelled: "Anulado",
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const POSITION_STYLES: Record<
  string,
  {
    label: string;
    className: string;
    textColor: string;
    fontSize: string;
    fontWeight: string;
  }
> = {
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
    textColor: "text-muted-foreground",
    fontSize: "text-sm",
    fontWeight: "font-medium",
  },
  grupo: {
    label: "Grupo",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-700",
    fontSize: "text-sm",
    fontWeight: "font-medium",
  },
  sin_asesor: {
    label: "Sin asesor",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    textColor: "text-muted-foreground",
    fontSize: "text-sm",
    fontWeight: "font-medium",
  },
};

function HierarchyNode({ node, level = 0 }: HierarchyNodeProps) {
  const { expandedNodes, toggleNode, entregasDetalle } =
    useContext(ExpandContext);
  const [showDetail, setShowDetail] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isManager = node.level === "gerente";
  const positionStyle = POSITION_STYLES[node.level] ?? DEFAULT_POSITION_STYLE;

  const detailKey =
    node.level === "sin_asesor"
      ? "sin_asesor"
      : node.id != null
        ? String(node.id)
        : null;
  const detailRows =
    node.level === "asesor" || node.level === "sin_asesor"
      ? (detailKey && entregasDetalle[detailKey]) || []
      : [];
  const hasDetail = detailRows.length > 0;

  return (
    <div>
      <div
        onClick={() => hasChildren && toggleNode(node.id)}
        className={`group grid grid-cols-[auto_1fr_120px_300px_100px_100px_44px] gap-4 items-center py-2 px-3 rounded-md hover:bg-accent/50 transition-all ${
          hasChildren ? "cursor-pointer" : ""
        } ${level > 0 ? "ml-6" : ""} ${isManager ? "font-medium" : ""}`}
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
            className={`truncate ${positionStyle.textColor} ${positionStyle.fontSize} ${positionStyle.fontWeight}`}
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
            className={`text-[10px] font-medium px-2 py-0.5 ${positionStyle.className}`}
          >
            {positionStyle.label}
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

        {/* Columna 6: Detalle de entregas */}
        <div className="flex justify-center">
          {hasDetail && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Ver detalle de entregas"
              title="Ver detalle de entregas"
              className={`h-7 w-7 ${showDetail ? "bg-accent text-foreground" : "text-muted-foreground"}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail((v) => !v);
              }}
            >
              <ListTree className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {hasDetail && showDetail && (
        <div
          className={`${level > 0 ? "ml-6" : ""} mb-2 mt-1 rounded-md border bg-muted/20`}
        >
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            Entregas de {node.name} ({detailRows.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-1.5 font-semibold">VIN</th>
                  <th className="px-3 py-1.5 font-semibold">Placa</th>
                  <th className="px-3 py-1.5 font-semibold">Marca / Modelo</th>
                  <th className="px-3 py-1.5 font-semibold">Cliente</th>
                  <th className="px-3 py-1.5 font-semibold">Sede</th>
                  <th className="px-3 py-1.5 font-semibold">Prog. entrega</th>
                  <th className="px-3 py-1.5 font-semibold">Entrega real</th>
                  <th className="px-3 py-1.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row, idx) => (
                  <tr
                    key={row.delivery_id ?? `${row.vehicle_id}-${idx}`}
                    className="border-b last:border-b-0 hover:bg-accent/40"
                  >
                    <td className="px-3 py-1.5 font-mono">{row.vin ?? "-"}</td>
                    <td className="px-3 py-1.5">{row.placa ?? "-"}</td>
                    <td className="px-3 py-1.5">
                      {[row.marca, row.modelo].filter(Boolean).join(" · ") || "-"}
                    </td>
                    <td className="px-3 py-1.5">{row.cliente ?? "-"}</td>
                    <td className="px-3 py-1.5">{row.sede ?? "-"}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {formatDateTime(row.fecha_programada)}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {formatDateTime(row.fecha_real)}
                    </td>
                    <td className="px-3 py-1.5">
                      {row.estado
                        ? (DELIVERY_STATUS_LABELS[row.estado] ?? row.estado)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

export default function HierarchyTree({
  hierarchy,
  entregasDetalle = {},
}: HierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number | null>>(() => {
    // Inicialmente expandir todos los nodos
    const allIds = new Set<number | null>();
    const collectIds = (nodes: DailyDeliveryHierarchyNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchy);
    return allIds;
  });

  const allNodeIds = useMemo(() => {
    const ids = new Set<number | null>();
    const collectIds = (nodes: DailyDeliveryHierarchyNode[]) => {
      nodes.forEach((node) => {
        ids.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchy);
    return ids;
  }, [hierarchy]);

  const toggleNode = (id: number | null) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(allNodeIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <ExpandContext.Provider
      value={{ expandedNodes, toggleNode, entregasDetalle }}
    >
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Desempeño por Gerente y Asesor
          </h3>
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
        <div className="grid grid-cols-[auto_1fr_120px_300px_100px_100px_44px] gap-4 px-3 py-2 border-b bg-muted/30">
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
    </ExpandContext.Provider>
  );
}
