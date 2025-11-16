import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/src/shared/components/SimpleDeleteDialog";
import { DISTRICT } from "../lib/district.constants";
import { DistrictResource } from "../lib/district.interface";

export type DistrictColumns = ColumnDef<DistrictResource>;

interface Props {
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const districtColumns = ({
  onDelete,
  permissions,
}: Props): DistrictColumns[] => [
  {
    accessorKey: "ubigeo",
    header: "Ubigeo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Distrito",
  },
  {
    accessorKey: "province",
    header: "Provincia",
  },
  {
    accessorKey: "department",
    header: "Departamento",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const { id } = row.original;
      const { ROUTE_UPDATE } = DISTRICT;

      return (
        <div className="flex items-center gap-2">
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
