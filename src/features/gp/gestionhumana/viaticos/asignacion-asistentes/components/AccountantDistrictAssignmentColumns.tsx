"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AccountantDistrictAssignmentResource } from "../lib/accountantDistrictAssignment.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type AccountantDistrictAssignmentColumns =
  ColumnDef<AccountantDistrictAssignmentResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const accountantDistrictAssignmentColumns = ({
  onUpdate,
  onDelete,
  permissions,
}: Props): AccountantDistrictAssignmentColumns[] => [
  {
    accessorKey: "worker.name",
    header: "Trabajador",
    cell: ({ row }) => {
      const worker = row.original.worker;
      return worker && <p className="font-semibold">{worker.name}</p>;
    },
  },
  {
    accessorKey: "worker.document",
    header: "Documento",
    cell: ({ row }) => {
      const worker = row.original.worker;
      return worker && <p>{worker.document}</p>;
    },
  },
  {
    accessorKey: "worker.position",
    header: "Cargo",
    cell: ({ row }) => {
      const worker = row.original.worker;
      return worker && <p>{worker.position}</p>;
    },
  },
  {
    accessorKey: "district.name",
    header: "Distrito",
    cell: ({ row }) => {
      const district = row.original.district;
      return district && <p className="font-semibold">{district.name}</p>;
    },
  },
  {
    accessorKey: "district.province",
    header: "Provincia",
    cell: ({ row }) => {
      const district = row.original.district;
      return district && <p>{district.province}</p>;
    },
  },
  {
    accessorKey: "district.department",
    header: "Departamento",
    cell: ({ row }) => {
      const district = row.original.district;
      return district && <p>{district.department}</p>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
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
