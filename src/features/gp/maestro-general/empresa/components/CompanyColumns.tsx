import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { CompanyResource } from "../lib/company.interface";
import { COMPANY } from "../lib/company.constants";

export type CompanyColumns = ColumnDef<CompanyResource>;

const { ROUTE_UPDATE } = COMPANY;

export const companyColumns = (): CompanyColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "abbreviation",
    header: "Abreviatura",
  },
  {
    accessorKey: "businessName",
    header: "Razón Social",
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
    accessorKey: "city",
    header: "Ciudad",
  },
  {
    accessorKey: "address",
    header: "Dirección",
  },
  {
    accessorKey: "website",
    header: "Sitio Web",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
        </div>
      );
    },
  },
];
