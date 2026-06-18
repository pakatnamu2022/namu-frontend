"use client";

import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCompareDynamics } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import { INVENTORY } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import type { CompareDynamicsMergedRow } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import BackButton from "@/shared/components/BackButton.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { DataTable } from "@/shared/components/DataTable.tsx";
import SearchInput from "@/shared/components/SearchInput.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip.tsx";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<CompareDynamicsMergedRow, unknown>[] = [
  {
    id: "product_dyn_code",
    accessorKey: "product_dyn_code",
    header: "Cód. Dynamics",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{String(getValue())}</span>
    ),
  },
  {
    id: "product_code",
    accessorKey: "product_code",
    header: "Cód. Local",
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ?? <span className="text-muted-foreground">—</span>;
    },
  },
  {
    id: "product_name",
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? (
        <span className="max-w-48 truncate block">{v}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: "local_quantity",
    accessorKey: "local_quantity",
    header: () => <span className="block text-right">Stock Sian</span>,
    cell: ({ row }) => {
      const total = row.original.local_quantity;
      const available = row.original.local_available;
      const inTransit = row.original.local_in_transit;
      const reserved = row.original.local_reserved;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block text-right tabular-nums font-medium cursor-default bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {total ?? "—"}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex flex-col gap-1 px-3 py-2">
            <span className="font-semibold text-xs mb-0.5">Detalle Stock Sian</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <span className="text-primary-foreground/70">Disponible</span>
              <span className="text-right tabular-nums">{available ?? "—"}</span>
              <span className="text-primary-foreground/70">Reservado</span>
              <span className="text-right tabular-nums">{reserved ?? "—"}</span>
            </div>
            <div className="border-t border-primary-foreground/20 mt-1 pt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <span className="text-primary-foreground/50 italic">En tránsito *</span>
              <span className="text-right tabular-nums text-primary-foreground/50">{inTransit ?? "—"}</span>
            </div>
            <p className="text-primary-foreground/40 text-[10px] italic mt-0.5 max-w-44">
              * Pendiente de confirmación, no suma al total.
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "dynamics_stock",
    accessorKey: "dynamics_stock",
    header: () => <span className="block text-right">Stock Dynamics</span>,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v != null ? (
        <span className="block text-right tabular-nums font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          {v}
        </span>
      ) : (
        <span className="block text-right text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          —
        </span>
      );
    },
  },
  {
    id: "difference",
    accessorKey: "difference",
    header: () => <span className="block text-right">Diferencia</span>,
    cell: ({ getValue }) => {
      const diff = getValue() as number | null;
      if (diff == null)
        return <span className="block text-right text-muted-foreground">—</span>;
      return (
        <span
          className={`block text-right tabular-nums font-semibold ${diff !== 0 ? "text-rose-600" : "text-emerald-600"}`}
        >
          {diff}
        </span>
      );
    },
  },
  {
    id: "found_in",
    accessorKey: "found_in",
    header: () => <span className="block text-center">Encontrado en</span>,
    cell: ({ getValue }) => {
      const v = getValue() as "SOLO_LOCAL" | "SOLO_DYNAMICS" | "AMBOS";
      const map = {
        AMBOS: {
          label: "Ambos",
          className: "bg-emerald-100 text-emerald-700 border-emerald-300",
        },
        SOLO_LOCAL: {
          label: "Solo SIAN",
          className: "bg-blue-100 text-blue-700 border-blue-300",
        },
        SOLO_DYNAMICS: {
          label: "Solo Dynamics",
          className: "bg-amber-100 text-amber-700 border-amber-300",
        },
      };
      const { label, className } = map[v] ?? { label: v, className: "" };
      return (
        <span
          className={`mx-auto flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
        >
          {label}
        </span>
      );
    },
  },
  {
    id: "match",
    accessorKey: "match",
    header: () => <span className="block text-center">Estado</span>,
    cell: ({ getValue }) =>
      getValue() ? (
        <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
      ) : (
        <XCircle className="size-4 text-rose-500 mx-auto" />
      ),
  },
];

export default function ComparativaDynamicsPage() {
  const [searchParams] = useSearchParams();
  const warehouseId = Number(searchParams.get("warehouse_id"));
  const { ABSOLUTE_ROUTE } = INVENTORY;
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading,
    error,
  } = useCompareDynamics(warehouseId, {
    enabled: !!warehouseId,
  });

  const mergedRows = useMemo<CompareDynamicsMergedRow[]>(() => {
    if (!response?.data?.products) return [];
    return response.data.products.map((row) => ({
      ...row,
      product_dyn_code: row.product_dyn_code.trim(),
    }));
  }, [response]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mergedRows;
    return mergedRows.filter(
      (row) =>
        row.product_dyn_code.toLowerCase().includes(q) ||
        (row.product_code ?? "").toLowerCase().includes(q) ||
        (row.product_name ?? "").toLowerCase().includes(q),
    );
  }, [mergedRows, search]);

  if (isLoading) return <PageSkeleton />;

  const meta = response?.data;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <div className="flex items-center gap-3">
          <BackButton route={ABSOLUTE_ROUTE} fullname={false} name="" />
          <TitleComponent
            title="Comparativa Dynamics"
            subtitle={
              meta
                ? `${meta.warehouse_code} — ${meta.warehouse_description}`
                : "Comparación de stock"
            }
            icon="BarChart2"
          />
        </div>
      </HeaderTableWrapper>

      {!warehouseId && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">No se especificó un almacén.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12 text-destructive gap-2">
          <AlertCircle className="size-4" />
          <p className="text-sm">Error al cargar los datos del endpoint.</p>
        </div>
      )}

      {meta && (
        <>
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" color="gray">
              Total productos: {meta.total_products}
            </Badge>
            <Badge variant="outline" color="green">
              Coinciden: {meta.matching_products}
            </Badge>
            <Badge variant="outline" color="red">
              Con diferencia: {meta.total_products - meta.matching_products}
            </Badge>
            <Badge variant="outline" color="gray">
              Fecha: {meta.comparison_date}
            </Badge>
          </div>

          <DataTable
            columns={columns}
            data={filteredRows}
            isVisibleColumnFilter={true}
          >
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por cód. Dynamics, cód. local o producto..."
            />
          </DataTable>
        </>
      )}
    </div>
  );
}
