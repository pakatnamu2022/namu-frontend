"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LIQUIDACION_BBSS } from "../lib/liquidacion-bbss.constant";
import { calculateGratification } from "../lib/liquidacion-bbss.actions";
import { errorToast, successToast } from "@/core/core.function";

const { MODEL, ROUTE_ADD } = LIQUIDACION_BBSS;

interface LiquidacionBbssActionsProps {
  periodId?: string;
  onCalculated?: () => void;
}

export default function LiquidacionBbssActions({
  periodId,
  onCalculated,
}: LiquidacionBbssActionsProps) {
  const push = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateGratification = async () => {
    if (!periodId) return;
    setIsCalculating(true);
    try {
      const result = await calculateGratification(periodId);
      successToast(
        `Gratificación calculada para ${result.workers_processed} trabajador(es).` +
          (result.skipped.length > 0
            ? ` ${result.skipped.length} omitido(s): ${result.skipped.join("; ")}`
            : ""),
      );
      onCalculated?.();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          "No se pudo calcular la gratificación.",
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        disabled={!periodId || isCalculating}
        tooltip={
          !periodId
            ? "Seleccione un periodo (Julio o Diciembre) para calcular"
            : "Calcula la gratificación y bonificación extraordinaria de todos los trabajadores activos de este periodo"
        }
        onClick={handleCalculateGratification}
      >
        {isCalculating ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <Calculator className="size-4 mr-2" />
        )}
        Calcular gratificación
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
