import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface TooltipItem {
  label: string;
  indicator?: ReactNode;
}

interface TableHeaderWithTooltipProps {
  label: string;
  tooltip:
    | string
    | {
        title?: string;
        items: TooltipItem[];
      };
}

/**
 * Componente reutilizable para headers de tabla con tooltips informativos.
 *
 * @example
 * // Modo simple (solo texto)
 * <TableHeaderWithTooltip
 *   label="Nro Dynamics"
 *   tooltip="Consulta si ya fue contabilizado en dynamics"
 * />
 *
 * @example
 * // Modo personalizado (con título e items)
 * <TableHeaderWithTooltip
 *   label="Estado SUNAT"
 *   tooltip={{
 *     title: "Estados de SUNAT",
 *     items: [
 *       {
 *         label: "Aceptado por SUNAT",
 *         indicator: <div className="size-2 rounded-full bg-green-600" />
 *       },
 *       {
 *         label: "En espera de respuesta",
 *         indicator: <div className="size-2 rounded-full bg-primary" />
 *       }
 *     ]
 *   }}
 * />
 */
export const TableHeaderWithTooltip = ({
  label,
  tooltip,
}: TableHeaderWithTooltipProps) => {
  const tooltipContent =
    typeof tooltip === "string" ? (
      <div className="space-y-2">
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span>{tooltip}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        {tooltip.title && (
          <h4 className="font-semibold text-sm mb-2">{tooltip.title}</h4>
        )}
        <div className="space-y-1.5 text-xs">
          {tooltip.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.indicator}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex items-center gap-1.5">
      <span>{label}</span>
      <Badge variant="ghost" tooltipVariant="muted" tooltip={tooltipContent}>
        <Info className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
      </Badge>
    </div>
  );
};
