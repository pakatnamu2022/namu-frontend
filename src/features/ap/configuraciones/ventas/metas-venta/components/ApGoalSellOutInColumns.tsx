import { ColumnDef } from "@tanstack/react-table";
import { ApGoalSellOutInResource } from "../lib/apGoalSellOutIn.interface";
import { Badge } from "@/components/ui/badge";

export type ApGoalSellOutInColumns = ColumnDef<ApGoalSellOutInResource>;

export const apGoalSellOutInColumns = (): ApGoalSellOutInColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "shop",
    header: "Tienda",
  },
  {
    accessorKey: "goal",
    header: "Objetivo",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Badge
          variant={value == "IN" ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value == "IN" ? "SELL IN" : "SELL OUT"}
        </Badge>
      );
    },
  },
];
