import { ColumnDef } from "@tanstack/react-table";
import { ModelsVnResource } from "../lib/modelsVn.interface";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MODELS_VN } from "../lib/modelsVn.constanst";

export type ModelsVnColumns = ColumnDef<ModelsVnResource>;

const { ROUTE_UPDATE } = MODELS_VN;

interface Props {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const modelsVnColumns = ({
  onDelete,
  onToggleStatus,
  permissions,
}: Props): ModelsVnColumns[] => [
  {
    accessorKey: "code",
    header: "Cod.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "version",
    header: "Versión",
  },
  {
    accessorKey: "power",
    header: "Potencia",
  },
  {
    accessorKey: "model_year",
    header: "Año",
  },
  {
    accessorKey: "wheelbase",
    header: "Distancia Ejes",
  },
  {
    accessorKey: "axles_number",
    header: "Nro Ejes",
  },
  {
    accessorKey: "width",
    header: "Ancho",
  },
  {
    accessorKey: "length",
    header: "Largo",
  },
  {
    accessorKey: "height",
    header: "Altura",
  },
  {
    accessorKey: "seats_number",
    header: "Núm. Asientos",
  },
  {
    accessorKey: "doors_number",
    header: "Núm. Puertas",
  },
  {
    accessorKey: "net_weight",
    header: "Peso Neto",
  },
  {
    accessorKey: "gross_weight",
    header: "Peso Bruto",
  },
  {
    accessorKey: "payload",
    header: "Carga Útil",
  },
  {
    accessorKey: "displacement",
    header: "Cilindrada",
  },
  {
    accessorKey: "cylinders_number",
    header: "Núm. Cilindros",
  },
  {
    accessorKey: "passengers_number",
    header: "Núm. Pasajeros",
  },
  {
    accessorKey: "wheels_number",
    header: "Núm. Ruedas",
  },
  {
    accessorKey: "distributor_price",
    header: "Precio Distribuidor",
  },
  {
    accessorKey: "transport_cost",
    header: "Costo Transporte",
  },
  {
    accessorKey: "other_amounts",
    header: "Otros Importes",
  },
  {
    accessorKey: "purchase_discount",
    header: "Dsc. Compra",
  },
  {
    accessorKey: "igv_amount",
    header: "Importe IGV",
  },
  {
    accessorKey: "total_purchase_excl_igv",
    header: "Total Compra sin IGV",
  },
  {
    accessorKey: "total_purchase_incl_igv",
    header: "Total Compra con IGV",
  },
  {
    accessorKey: "sale_price",
    header: "Total Venta",
  },
  {
    accessorKey: "margin",
    header: "Margen",
  },
  {
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "family",
    header: "Familia",
  },
  {
    accessorKey: "class",
    header: "Clase Artículo",
  },
  {
    accessorKey: "fuel",
    header: "Combustible",
  },
  {
    accessorKey: "vehicle_type",
    header: "Tipo Vehículo",
  },
  {
    accessorKey: "body_type",
    header: "Carrocería",
  },
  {
    accessorKey: "traction_type",
    header: "Tracción",
  },
  {
    accessorKey: "transmission",
    header: "Transmisión",
  },
  {
    accessorKey: "currency_type",
    header: "Moneda",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const { id, status } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              thumbClassName="size-4"
              onCheckedChange={(checked) => onToggleStatus(id, checked)}
              className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router.push(`${ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
