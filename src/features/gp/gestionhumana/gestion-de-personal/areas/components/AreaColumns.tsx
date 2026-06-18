"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AreaResource } from "../lib/area.interface";

export type AreaColumns = ColumnDef<AreaResource>;

export const areaColumns = ({}: {
  onDelete: (id: number) => void;
}): AreaColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
];
