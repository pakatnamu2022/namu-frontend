import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Building2, Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { SuppliersResource } from "../lib/suppliers.interface";
import { SUPPLIERS } from "../lib/suppliers.constants";

export type SuppliersColumns = ColumnDef<SuppliersResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const suppliersColumns = ({
  onDelete,
  permissions,
}: Props): SuppliersColumns[] => [
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
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
    accessorKey: "direction",
    header: "Dirección",
  },
  {
    accessorKey: "supplier_tax_class_type",
    header: "Clase de Impuesto",
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
      const router = useRouter();
      const { id } = row.original;
      const { ROUTE_UPDATE, ROUTE } = SUPPLIERS;

      return (
        <div className="flex items-center gap-2">
          {/* Establecimientos */}
          {
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Establecimientos"
              onClick={() => router.push(`${ROUTE}/establecimientos/${id}`)}
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
