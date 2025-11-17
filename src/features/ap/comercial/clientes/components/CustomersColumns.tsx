import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Building2, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { CustomersResource } from "../lib/customers.interface";
import { CUSTOMERS } from "../lib/customers.constants";
import OpportunitiesSheet from "./OpportunitiesSheet";

export type CustomersColumns = ColumnDef<CustomersResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const customersColumns = ({
  onDelete,
  permissions,
}: Props): CustomersColumns[] => [
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
    accessorKey: "type_person",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("type_person")}</Badge>
    ),
  },
  {
    accessorKey: "person_segment",
    header: "Segmento",
    cell: ({ row }) => (
      <Badge variant="default">{row.getValue("person_segment")}</Badge>
    ),
  },
  {
    accessorKey: "district",
    header: "Distrito",
  },
  {
    accessorKey: "nationality",
    header: "Nacionalidad",
  },
  {
    accessorKey: "direction",
    header: "Dirección",
  },
  {
    accessorKey: "origin",
    header: "Origen",
  },
  {
    accessorKey: "tax_class_type",
    header: "Clase de Impuesto",
  },
  {
    accessorKey: "marital_status",
    header: "Estado Civil",
  },
  {
    accessorKey: "gender",
    header: "Género",
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
      const { ROUTE_UPDATE, ABSOLUTE_ROUTE } = CUSTOMERS;

      return (
        <div className="flex items-center gap-2">
          {/* Opportunities */}
          <OpportunitiesSheet customerId={id} />

          {/* Establecimientos */}
          {
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Establecimientos"
              onClick={() => router(`${ABSOLUTE_ROUTE}/establecimientos/${id}`)}
            >
              <Building2 className="size-5" />
            </Button>
          }

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
