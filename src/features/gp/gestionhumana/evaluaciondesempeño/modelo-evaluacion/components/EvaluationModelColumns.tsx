"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { EvaluationModelResource } from "../lib/evaluationModel.interface";
import { EvaluationModelOptions } from "./EvaluationModelOptions";

export const evaluationModelColumns: ColumnDef<EvaluationModelResource>[] = [
  {
    accessorKey: "category_details",
    header: "Categorías",
    cell: ({ row }) => {
      const categories = row.original.category_details || [];
      return (
        <div className="flex flex-wrap gap-1 max-w-md">
          {categories.map((category) => (
            <Badge
              size={"sm"}
              key={category.id}
              variant="outline"
              className="text-xs"
            >
              {category.name}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "leadership_weight",
    header: "Liderazgo (%)",
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("leadership_weight"));
      return (
        <div className="text-center font-medium">{weight.toFixed(2)}%</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "self_weight",
    header: "Autoevaluación (%)",
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("self_weight"));
      return (
        <div className="text-center font-medium">{weight.toFixed(2)}%</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "par_weight",
    header: "Pares (%)",
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("par_weight"));
      return (
        <div className="text-center font-medium">{weight.toFixed(2)}%</div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "report_weight",
    header: "Informes (%)",
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("report_weight"));
      return (
        <div className="text-center font-medium">{weight.toFixed(2)}%</div>
      );
    },
    enableSorting: true,
  },
  {
    id: "total",
    header: "Total (%)",
    cell: ({ row }) => {
      const total =
        parseFloat(row.original.leadership_weight) +
        parseFloat(row.original.self_weight) +
        parseFloat(row.original.par_weight) +
        parseFloat(row.original.report_weight);

      const isValid = Math.abs(total - 100) < 0.01;

      return (
        <div
          className={`text-center font-bold ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {total.toFixed(2)}%
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <EvaluationModelOptions row={row} />,
  },
];
