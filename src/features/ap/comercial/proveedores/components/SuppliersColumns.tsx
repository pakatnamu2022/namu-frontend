import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Badge } from "@/components/ui/badge";
import { SuppliersResource } from "../lib/suppliers.interface";

export type SuppliersColumns = ColumnDef<SuppliersResource>;

interface Props {
  onEstablishments: (id: number) => void;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const suppliersColumns = ({
  onEstablishments,
  onUpdate,
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
      <Badge color="secondary">{row.getValue("type_person")}</Badge>
    ),
  },
  {
    accessorKey: "person_segment",
    header: "Segmento",
    cell: ({ row }) => (
      <Badge color="default">{row.getValue("person_segment")}</Badge>
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
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Establecimientos */}
          <ButtonAction
            icon={Building2}
            tooltip="Establecimientos"
            onClick={() => onEstablishments(id)}
          />

          {/* Edit */}
          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            canRender={permissions.canUpdate}
            onClick={() => onUpdate(id)}
          />

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
