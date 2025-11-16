import { ColumnDef } from "@tanstack/react-table";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { StoreVisitsResource } from "../lib/storeVisits.interface";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { STORE_VISITS } from "../lib/storeVisits.constants";

export type StoreVisitsColumns = ColumnDef<StoreVisitsResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const storeVisitsColumns = ({
  onDelete,
  permissions,
}: Props): StoreVisitsColumns[] => [
  {
    accessorKey: "registration_date",
    header: "Fecha de Registro",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "full_name",
    header: "Nombres Completos",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "worker",
    header: "Asesor",
  },
  {
    accessorKey: "vehicle_brand",
    header: "Marca Vehículo",
  },
  {
    accessorKey: "document_type",
    header: "Tipo Documento",
  },
  {
    accessorKey: "num_doc",
    header: "N° Documento",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const { id } = row.original;
      const { ROUTE_UPDATE } = STORE_VISITS;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
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
