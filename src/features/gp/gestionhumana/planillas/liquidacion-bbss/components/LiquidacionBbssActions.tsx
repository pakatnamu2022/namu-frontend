"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2, Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LIQUIDACION_BBSS } from "../lib/liquidacion-bbss.constant";
import {
  calculateCts,
  calculateGratification,
  getGratificationStatus,
  GratificationStatus,
} from "../lib/liquidacion-bbss.actions";
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
  const [isCalculatingGrati, setIsCalculatingGrati] = useState(false);
  const [isCalculatingCts, setIsCalculatingCts] = useState(false);
  const [ctsStatus, setCtsStatus] = useState<GratificationStatus | null>(
    null,
  );

  // La CTS depende de que la gratificación del semestre de referencia ya esté
  // calculada — se consulta cada vez que cambia el periodo para habilitar/
  // deshabilitar el botón sin esperar a que el usuario haga clic.
  useEffect(() => {
    if (!periodId) {
      setCtsStatus(null);
      return;
    }
    let cancelled = false;
    getGratificationStatus(periodId)
      .then((status) => !cancelled && setCtsStatus(status))
      .catch(() => !cancelled && setCtsStatus(null));
    return () => {
      cancelled = true;
    };
  }, [periodId]);

  const handleCalculateGratification = async () => {
    if (!periodId) return;
    setIsCalculatingGrati(true);
    try {
      const result = await calculateGratification(periodId);
      successToast(
        `Gratificación calculada para ${result.workers_processed} trabajador(es).` +
          (result.skipped.length > 0
            ? ` ${result.skipped.length} omitido(s): ${result.skipped.join("; ")}`
            : ""),
      );
      onCalculated?.();
      const status = await getGratificationStatus(periodId).catch(
        () => null,
      );
      if (status) setCtsStatus(status);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          "No se pudo calcular la gratificación.",
      );
    } finally {
      setIsCalculatingGrati(false);
    }
  };

  const handleCalculateCts = async () => {
    if (!periodId) return;
    setIsCalculatingCts(true);
    try {
      const result = await calculateCts(periodId);
      successToast(
        `CTS calculada para ${result.workers_processed} trabajador(es).` +
          (result.skipped.length > 0
            ? ` ${result.skipped.length} omitido(s): ${result.skipped.join("; ")}`
            : ""),
      );
      onCalculated?.();
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? "No se pudo calcular la CTS.");
    } finally {
      setIsCalculatingCts(false);
    }
  };

  const ctsDisabled = !periodId || !ctsStatus?.ready || isCalculatingCts;
  const ctsTooltip = !periodId
    ? "Seleccione un periodo (Mayo o Noviembre) para calcular"
    : (ctsStatus?.message ??
      "Calcula la CTS semestral de todos los trabajadores activos de este periodo");

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto flex-wrap">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        disabled={!periodId || isCalculatingGrati}
        tooltip={
          !periodId
            ? "Seleccione un periodo (Julio o Diciembre) para calcular"
            : "Calcula la gratificación y bonificación extraordinaria de todos los trabajadores activos de este periodo"
        }
        onClick={handleCalculateGratification}
      >
        {isCalculatingGrati ? (
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
        disabled={ctsDisabled}
        tooltip={ctsTooltip}
        onClick={handleCalculateCts}
      >
        {isCalculatingCts ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <Wallet className="size-4 mr-2" />
        )}
        Calcular CTS
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
