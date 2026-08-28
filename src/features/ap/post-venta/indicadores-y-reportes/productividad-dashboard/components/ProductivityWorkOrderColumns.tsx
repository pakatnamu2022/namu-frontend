import type { ColumnDef } from "@tanstack/react-table";
import {
  ProductivityWorkOrder,
  ProductivityWorkOrderWithoutLabour,
} from "../lib/productivityDashboard.interface";
import { formatDate, formatHours } from "@/core/core.function";
import { CopyCell } from "@/shared/components/CopyCell";

export const productivityWorkOrderColumns =
  (): ColumnDef<ProductivityWorkOrder>[] => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => (
        <div className="font-medium text-center w-8">{row.index + 1}</div>
      ),
      size: 50,
    },
    {
      accessorKey: "work_order_number",
      header: "N° OT",
      cell: ({ row }) => (
        <div>
          <CopyCell
            value={row.original.work_order_number}
            className="font-semibold"
          />
          <div className="text-xs text-muted-foreground">
            {row.original.vehicle_plate} -{" "}
            {formatDate(row.original.fecha_facturacion)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "asesor",
      header: "Asesor",
    },
    {
      accessorKey: "tipo_planificacion",
      header: "Tipo / Categoría",
      cell: ({ row }) => (
        <div>
          <div>{row.original.tipo_planificacion}</div>
          {row.original.categoria_tipo && (
            <div className="text-xs text-muted-foreground">
              {row.original.categoria_tipo}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "descripcion_labour",
      header: "Mano de obra",
      cell: ({ row }) => row.original.descripcion_labour || "-",
    },
    {
      accessorKey: "horas_facturadas_tecnico",
      header: "H. facturadas (técnico)",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            {formatHours(row.original.horas_facturadas_tecnico)}
          </div>
          {row.original.cantidad_tecnicos > 1 && (
            <div className="text-xs text-muted-foreground">
              {formatHours(row.original.horas_facturadas_total_ot)} entre{" "}
              {row.original.cantidad_tecnicos} técnicos
            </div>
          )}
        </div>
      ),
    },
  ];

export const productivityWorkOrderWithoutLabourColumns =
  (): ColumnDef<ProductivityWorkOrderWithoutLabour>[] => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => (
        <div className="font-medium text-center w-8">{row.index + 1}</div>
      ),
      size: 50,
    },
    {
      accessorKey: "work_order_number",
      header: "N° OT",
      cell: ({ row }) => (
        <div>
          <CopyCell
            value={row.original.work_order_number}
            className="font-semibold"
          />
          <div className="text-xs text-muted-foreground">
            {row.original.vehicle_plate} -{" "}
            {formatDate(row.original.fecha_facturacion)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "asesor",
      header: "Asesor",
    },
    {
      accessorKey: "tipo_planificacion",
      header: "Tipo",
    },
    {
      accessorKey: "observacion",
      header: "Observación",
      cell: ({ row }) => (
        <span className="text-xs text-red-600">{row.original.observacion}</span>
      ),
    },
  ];
