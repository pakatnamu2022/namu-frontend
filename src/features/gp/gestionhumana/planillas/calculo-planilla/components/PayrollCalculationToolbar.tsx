"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, RefreshCw, Eye, FileText, CalendarDays, Loader2 } from "lucide-react";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import {
  generatePayrollCalculations,
  recalculatePayrollCalculations,
} from "../lib/payroll-calculation.actions";
import { errorToast, successToast } from "@/core/core.function";
import { PayrollPeriodStatus } from "../../periodo-planilla/lib/payroll-period.interface";

export type ActiveView = "attendances" | "totals" | "report";

interface Props {
  periodId: number;
  periodStatus: PayrollPeriodStatus;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onSuccess: () => void;
}

export default function PayrollCalculationToolbar({
  periodId,
  periodStatus,
  activeView,
  onChangeView,
  onSuccess,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showRecalcConfirm, setShowRecalcConfirm] = useState(false);
  const [hasExistingCalculations, setHasExistingCalculations] = useState(false);

  const isClosed = periodStatus === "CLOSED";
  const hasCalculations =
    periodStatus === "CALCULATED" ||
    periodStatus === "CLOSED" ||
    hasExistingCalculations;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await generatePayrollCalculations(periodId);
      successToast(response.message ?? "Cálculos generados correctamente");
      if (response.data.errors.length > 0) {
        response.data.errors.forEach((err) => errorToast(err));
      }
      onSuccess();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        setHasExistingCalculations(true);
        errorToast(
          "Ya existen cálculos para este período. Usa el botón Recalcular.",
        );
      } else {
        errorToast(
          error?.response?.data?.message ?? "Error al generar los cálculos",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecalculate = async () => {
    setShowRecalcConfirm(false);
    setIsRecalculating(true);
    try {
      const response = await recalculatePayrollCalculations(periodId);
      successToast(response.message ?? "Cálculos recalculados correctamente");
      if (response.data.errors.length > 0) {
        response.data.errors.forEach((err) => errorToast(err));
      }
      onSuccess();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        errorToast("No se puede recalcular: hay cálculos APROBADOS o PAGADOS.");
      } else {
        errorToast(
          error?.response?.data?.message ?? "Error al recalcular los cálculos",
        );
      }
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={activeView === "attendances" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangeView("attendances")}
        >
          <CalendarDays className="size-4 mr-1.5" />
          Asistencias
        </Button>

        <Button
          variant={activeView === "totals" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangeView("totals")}
          disabled={isClosed}
        >
          <Eye className="size-4 mr-1.5" />
          Ver Totales
        </Button>

        <Button
          variant={activeView === "report" ? "default" : "outline"}
          size="sm"
          onClick={() => onChangeView("report")}
        >
          <FileText className="size-4 mr-1.5" />
          Resumen
        </Button>

        {!hasCalculations && (
          <Button
            variant="default"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || isClosed}
          >
            {isGenerating ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Calculator className="size-4 mr-1.5" />
            )}
            Generar Cálculos
          </Button>
        )}

        {/* {hasCalculations && !isClosed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecalcConfirm(true)}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-1.5" />
            )}
            Recalcular
          </Button>
        )} */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRecalcConfirm(true)}
          disabled={isRecalculating}
        >
          {isRecalculating ? (
            <Loader2 className="size-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="size-4 mr-1.5" />
          )}
          Recalcular
        </Button>
      </div>

      <SimpleConfirmDialog
        open={showRecalcConfirm}
        onOpenChange={setShowRecalcConfirm}
        onConfirm={handleRecalculate}
        title="Recalcular Nómina"
        description="Esto eliminará los cálculos actuales y los regenerará con las asistencias actualizadas. Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmText="Sí, recalcular"
        cancelText="Cancelar"
        icon="warning"
        isLoading={isRecalculating}
      />
    </>
  );
}
