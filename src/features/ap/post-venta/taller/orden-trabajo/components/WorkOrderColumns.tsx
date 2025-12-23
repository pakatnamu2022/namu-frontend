import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Settings, ClipboardCheck, Package, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export type WorkOrderColumns = ColumnDef<WorkOrderResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onInspect: (id: number) => void;
  onRequestParts: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const workOrderColumns = ({
  onDelete,
  onUpdate,
  onManage,
  onInspect,
  onRequestParts,
  permissions,
}: Props): WorkOrderColumns[] => [
  {
    accessorKey: "correlative",
    header: "Correlativo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vehicle_plate",
    header: "Placa",
  },
  {
    accessorKey: "vehicle_vin",
    header: "VIN",
  },
  {
    accessorKey: "mileage",
    header: "Kilometraje",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? `${value} km` : "-";
    },
  },
  {
    accessorKey: "fuel_level",
    header: "Nivel de Combustible",
  },
  {
    accessorKey: "opening_date",
    header: "Fecha de Apertura",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value + "T00:00:00");
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "estimated_delivery_date",
    header: "Fecha Est. Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value + "T00:00:00");
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "actual_delivery_date",
    header: "Fecha Real Entrega",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "-";
      try {
        const date = new Date(value + "T00:00:00");
        return format(date, "dd/MM/yyyy", { locale: es });
      } catch {
        return value;
      }
    },
  },
  {
    accessorKey: "is_guarantee",
    header: "Garantía",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_recall",
    header: "Recall",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_invoiced",
    header: "Facturado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id, is_inspection_completed } = row.original;

      // const handleDownloadPdf = async () => {
      //   try {
      //     await downloadWorkOrderPdf(id);
      //   } catch {
      //     errorToast("Error al descargar el PDF");
      //   }
      // };

      return (
        <div className="flex items-center gap-2">
          {!is_inspection_completed && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onInspect(id)}
              tooltip="Inspección de Vehículo"
            >
              <ClipboardCheck className="size-5" />
            </Button>
          )}

          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Gestionar"
              onClick={() => onManage(id)}
            >
              <Settings className="size-5" />
            </Button>
          )}

          {/* <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={handleDownloadPdf}
            tooltip="PDF"
          >
            <Download className="size-5" />
          </Button> */}

          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onRequestParts(id)}
            tooltip="Solicitar Repuestos"
          >
            <Package className="size-5" />
          </Button>

          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
