"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components/DataTable";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { VehicleMovement } from "../lib/vehicles.interface";

interface Props {
  movements: VehicleMovement[];
  loading?: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Empty State Component
const EmptyState = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center space-y-2">
      <History className="size-10 mx-auto text-muted-foreground" />
      <h3 className="text-sm font-medium text-foreground/90">
        Sin movimientos
      </h3>
      <p className="text-xs text-muted-foreground">
        Aún no hay movimientos registrados
      </p>
    </div>
  </div>
);

const columns: ColumnDef<VehicleMovement>[] = [
  {
    id: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <div>
        <div className="text-xs font-medium text-foreground/80 whitespace-nowrap">
          {formatDate(row.original.date)}
        </div>
        <div className="text-[11px] text-muted-foreground whitespace-nowrap">
          {formatTime(row.original.date)}
        </div>
      </div>
    ),
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const statusColor = row.original.status_color || "#94a3b8";
      return (
        <div className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: statusColor }}
          >
            {row.original.status}
          </span>
        </div>
      );
    },
  },
  {
    id: "origin_warehouse",
    header: "Almacén origen",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.origin_warehouse?.description ?? "—"}
      </span>
    ),
  },
  {
    id: "warehouse",
    header: "Almacén destino",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.warehouse?.description ?? "—"}
      </span>
    ),
  },
];

// Movements Table Component
const MovementsTable = ({ movements }: { movements: VehicleMovement[] }) => {
  const ordered = useMemo(
    () =>
      [...movements].sort((a, b) => {
        const dateDiff =
          new Date(b.date).getTime() - new Date(a.date).getTime();
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      }),
    [movements],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge color="blue">
          {movements.length}{" "}
          {movements.length === 1 ? "movimiento" : "movimientos"}
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={ordered}
        variant="ghost"
        isVisibleColumnFilter={false}
        getRowId={(movement) => String(movement.id)}
        renderSubRow={(movement) => (
          <p className="text-xs uppercase text-foreground/90">
            {movement.observation || "Sin observaciones"}
          </p>
        )}
      />
    </div>
  );
};

// Main Component
export default function VehicleMovements({
  movements,
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        className="size-7"
        disabled={loading}
        tooltip="Ver Movimientos"
        onClick={() => setOpen(true)}
      >
        <History className={cn("size-4", { "animate-spin": loading })} />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Historial de Movimientos"
        icon="History"
        size="4xl"
        childrenFooter={
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
        }
      >
        {movements.length > 0 ? (
          <MovementsTable movements={movements} />
        ) : (
          <EmptyState />
        )}
      </GeneralSheet>
    </>
  );
}
