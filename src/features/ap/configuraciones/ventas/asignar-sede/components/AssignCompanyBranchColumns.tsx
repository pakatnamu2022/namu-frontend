import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  AsesorResource,
  AssignCompanyBranchResource,
} from "../lib/assignCompanyBranch.interface";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ASSIGN_COMPANY_BRANCH } from "../lib/assignCompanyBranch.constants";

export type AssignCompanyBranchColumns = ColumnDef<AssignCompanyBranchResource>;

interface Props {
  permissions: {
    canUpdate: boolean;
  };
}

export const assignCompanyBranchColumns = ({
  permissions,
}: Props): AssignCompanyBranchColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "assigned_workers",
    header: "Asesores",
    cell: ({ getValue }) => {
      const asesores = getValue() as AsesorResource[];
      if (!asesores || asesores.length === 0) {
        return <span className="text-gray-400 italic">Sin asesores</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {asesores.map((asesor) => (
            <span
              key={asesor.id}
              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
            >
              {asesor.name}
            </span>
          ))}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useRouter();
      const { sede_id } = row.original;
      const { ROUTE_UPDATE } = ASSIGN_COMPANY_BRANCH;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router.push(`${ROUTE_UPDATE}/${sede_id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
