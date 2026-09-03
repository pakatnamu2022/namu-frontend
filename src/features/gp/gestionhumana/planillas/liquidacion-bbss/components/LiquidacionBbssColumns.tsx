"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LiquidacionBbssResource } from "../lib/liquidacion-bbss.interface";
import { Button } from "@/components/ui/button";
import { Download, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { useNavigate } from "react-router-dom";
import { LIQUIDACION_BBSS } from "../lib/liquidacion-bbss.constant";
import { downloadLiquidationBbssPayslip } from "../lib/liquidacion-bbss.actions";
import { errorToast } from "@/core/core.function";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Infiere el tipo de boleta descargable a partir de la descripción del tipo de BB.SS. */
function payslipTypeFor(type: string | null): "cts" | "gratificacion" | null {
  if (!type) return null;
  if (/cts/i.test(type)) return "cts";
  if (/gratificaci/i.test(type)) return "gratificacion";
  return null;
}

export type LiquidacionBbssColumns = ColumnDef<LiquidacionBbssResource>;

export const liquidacionBbssColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): LiquidacionBbssColumns[] => [
  {
    accessorKey: "worker",
    header: "Trabajador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => (
      <span className="text-wrap line-clamp-1">
        {(getValue() as string) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return (
        <span className="font-mono">
          S/ {val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { id, worker_id, period_id, type } = row.original;
      const { ROUTE_UPDATE } = LIQUIDACION_BBSS;
      const payslipType = payslipTypeFor(type);

      const handleDownloadPayslip = async () => {
        if (!payslipType) return;
        try {
          const blob = await downloadLiquidationBbssPayslip(
            period_id,
            worker_id,
            payslipType,
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `boleta-${payslipType}-${worker_id}-${period_id}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error: any) {
          errorToast(
            error?.response?.data?.message ?? "No se pudo generar la boleta.",
          );
        }
      };

      return (
        <div className="flex items-center gap-2">
          {payslipType && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={handleDownloadPayslip}
                  >
                    <Download className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar boleta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
