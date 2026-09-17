import type { ColumnDef } from "@tanstack/react-table";
import {
  ProductivityWorkOrder,
  ProductivityWorkOrderWithoutLabour,
} from "../lib/productivityDashboard.interface";
import { formatDate, formatHours } from "@/core/core.function";

export const productivityWorkOrderColumns = (
  onViewWorkOrder?: (workOrderId: number) => void,
): ColumnDef<ProductivityWorkOrder>[] => [
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
          <button
            type="button"
            onClick={() => onViewWorkOrder?.(row.original.work_order_id)}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.work_order_number}
          </button>
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
      accessorKey: "trabajos",
      header: "Mano de obra",
      cell: ({ row }) => {
        const trabajos = row.original.trabajos ?? [];
        if (trabajos.length === 0) return "-";
        return (
          <ul className="list-disc pl-4 space-y-0.5">
            {trabajos.map((trabajo, index) => (
              <li key={index}>{trabajo.descripcion_labour}</li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "horas_facturadas_tecnico",
      header: "H. facturadas (técnico)",
      cell: ({ row }) => {
        const trabajos = row.original.trabajos ?? [];
        const horasFacturadasTecnico = trabajos.reduce(
          (sum, trabajo) => sum + trabajo.horas_facturadas_tecnico,
          0,
        );
        return (
          <div>
            <div className="font-semibold">
              {formatHours(horasFacturadasTecnico)}
            </div>
            {row.original.cantidad_tecnicos > 1 && (
              <div className="text-xs text-muted-foreground">
                {formatHours(row.original.horas_facturadas_total_ot)} entre{" "}
                {row.original.cantidad_tecnicos} técnicos
              </div>
            )}
          </div>
        );
      },
    },
  ];

export const productivityWorkOrderWithoutLabourColumns = (
  onViewWorkOrder?: (workOrderId: number) => void,
): ColumnDef<ProductivityWorkOrderWithoutLabour>[] => [
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
          <button
            type="button"
            onClick={() => onViewWorkOrder?.(row.original.work_order_id)}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.work_order_number}
          </button>
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
