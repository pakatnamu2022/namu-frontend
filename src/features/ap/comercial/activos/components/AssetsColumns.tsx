import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import MigrationStatusBadge from "@/features/ap/facturacion/electronic-documents/components/MigrationStatusBadge";
import AssetMigrationHistory from "./AssetMigrationHistory";
import { AssetResource } from "../lib/assets.interface";

export type AssetsColumn = ColumnDef<AssetResource>;

interface Props {
  onDelete: (id: number) => void;
  onDispatchMigration: (id: number) => void;
  permissions: {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
}

export const AssetsColumns = ({
  onDelete,
  onDispatchMigration,
  permissions,
}: Props): AssetsColumn[] => [
  {
    id: "vin",
    header: "VIN / Placa",
    cell: ({ row }) => {
      const v = row.original.vehicle;
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{v?.vin ?? "-"}</span>
          <span className="text-xs text-muted-foreground">{v?.plate ?? "Sin placa"}</span>
        </div>
      );
    },
  },
  {
    id: "vehicle",
    header: "Vehículo",
    cell: ({ row }) => {
      const v = row.original.vehicle;
      return (
        <div className="flex flex-col">
          <span>
            {[v?.brand, v?.model].filter(Boolean).join(" ") || "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            {[v?.year, v?.color].filter(Boolean).join(" · ")}
          </span>
        </div>
      );
    },
  },
  {
    id: "sede",
    header: "Sede / Almacén",
    cell: ({ row }) => {
      const v = row.original.vehicle;
      return (
        <div className="flex flex-col">
          <span>{v?.sede ?? "-"}</span>
          <span className="text-xs text-muted-foreground">{v?.warehouse ?? ""}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "worker",
    header: "Responsable",
    cell: ({ row }) => row.original.worker?.name ?? "-",
  },
  {
    accessorKey: "assigned_date",
    header: "Fecha asignación",
    cell: ({ getValue }) => (getValue() as string) ?? "-",
  },
  {
    accessorKey: "dyn_series",
    header: "Transacción Dynamics",
    cell: ({ getValue }) => (getValue() as string) ?? "-",
  },
  {
    accessorKey: "migration_status",
    header: "Migración",
    cell: ({ getValue }) => (
      <MigrationStatusBadge migration_status={getValue() as string} />
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, migration_status } = row.original;
      return (
        <div className="flex items-center gap-2">
          <AssetMigrationHistory assetId={id} />
          {migration_status !== "completed" && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Reintentar migración"
              onClick={() => onDispatchMigration(id)}
            >
              <RefreshCcw className="size-4" />
            </Button>
          )}
          {permissions.canDelete && migration_status !== "completed" && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
