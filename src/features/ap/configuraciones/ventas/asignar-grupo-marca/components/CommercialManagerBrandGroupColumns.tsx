import { ColumnDef } from "@tanstack/react-table";
import {
  AsesorResource,
  CommercialManagerBrandGroupResource,
} from "../lib/commercialManagerBrandGroup.interface";
import { useRouter } from "next/navigation";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "../lib/commercialManagerBrandGroup.constants";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export type CommercialManagerBrandGroupColumns =
  ColumnDef<CommercialManagerBrandGroupResource>;

export const commercialManagerBrandGroupColumns =
  (): CommercialManagerBrandGroupColumns[] => [
    {
      accessorKey: "period",
      header: "Periodo",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value && <p className="font-semibold">{value}</p>;
      },
    },
    {
      accessorKey: "brand_group",
      header: "Grupo de Marca",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value && <p className="font-semibold">{value}</p>;
      },
    },
    {
      accessorKey: "commercial_managers",
      header: "Gerentes Comerciales",
      cell: ({ getValue }) => {
        const asesores = getValue() as AsesorResource[];
        if (!asesores || asesores.length === 0) {
          return (
            <span className="text-gray-400 italic">
              Sin gerentes comerciales
            </span>
          );
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
        const { brand_group_id } = row.original;
        const { ROUTE_UPDATE } = COMMERCIAL_MANAGER_BRAND_GROUP;

        return (
          <div className="flex items-center justify-center gap-2">
            {/* Edit */}
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router.push(`${ROUTE_UPDATE}/${brand_group_id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          </div>
        );
      },
    },
  ];
