import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ADJUSTMENT } from "../lib/adjustmentsProduct.constants";
import { AdjustmentsProductListItem } from "../lib/adjustmentsProduct.interface";

export type AdjustmentsProductColumns = ColumnDef<AdjustmentsProductListItem>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const adjustmentsProductColumns = ({
  onDelete,
  permissions,
}: Props): AdjustmentsProductColumns[] => [
  {
    accessorKey: "full_name",
    header: "Nombre Completo",
  },
  {
    accessorKey: "num_doc",
    header: "Documento",
  },
  {
    accessorKey: "document_type",
    header: "Tipo Documento",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("document_type")}</Badge>
    ),
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "district",
    header: "Distrito",
  },
  {
    accessorKey: "activity_economic",
    header: "Actividad Económica",
  },
  {
    accessorKey: "legal_representative_full_name",
    header: "Representante Legal",
  },
  {
    accessorKey: "driving_license",
    header: "Licencia de Conducir",
  },
  {
    accessorKey: "status_license",
    header: "Estado de la Licencia",
  },
  {
    accessorKey: "restriction",
    header: "Restricción",
  },
  {
    accessorKey: "company_status",
    header: "Estado de la Empresa",
  },
  {
    accessorKey: "company_condition",
    header: "Condición de la Empresa",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;
      const { ROUTE_UPDATE } = ADJUSTMENT;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
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
