"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calculator, RefreshCw, Loader2 } from "lucide-react";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import {
  generatePayrollCalculations,
  recalculatePayrollCalculations,
} from "../lib/payroll-calculation.actions";
import { errorToast, successToast } from "@/core/core.function";
import { PayrollPeriodStatus } from "../../periodo-planilla/lib/payroll-period.interface";
import { PAYROLL_PERIOD_STATUS } from "../../periodo-planilla/lib/payroll-period.constant";

export type ActiveView = "attendances" | "totals" | "report";
export type Quincena = 1 | 2 | null;

interface Props {
  periodId: number;
  periodStatus: PayrollPeriodStatus;
  biweeklyDate?: string | null;
  activeView?: ActiveView;
  onChangeView?: (view: ActiveView) => void;
  quincena?: Quincena;
  onQuincenaChange?: (quincena: Quincena) => void;
  onSuccess: () => void;
  /** Si se provee, sobreescribe la lógica de status para decidir si hay cálculos en la quincena actual */
  hasQuincenaCalculations?: boolean;
}

export default function PayrollCalculationToolbar({
  periodId,
  periodStatus,
  biweeklyDate,
  quincena,
  onQuincenaChange,
  onSuccess,
  hasQuincenaCalculations,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showRecalcConfirm, setShowRecalcConfirm] = useState(false);
  const [hasExistingCalculations, setHasExistingCalculations] = useState(false);

  const isClosed = periodStatus === PAYROLL_PERIOD_STATUS.CLOSED;
  const hasCalculationsByStatus =
    periodStatus === PAYROLL_PERIOD_STATUS.CALCULATED ||
    periodStatus === PAYROLL_PERIOD_STATUS.CLOSED ||
    hasExistingCalculations;

  // Si se provee hasQuincenaCalculations (no undefined), úsalo; si no, cae al status general
  const hasCalculations =
    hasQuincenaCalculations !== undefined
      ? hasQuincenaCalculations
      : hasCalculationsByStatus;

  const hasBiweekly = Boolean(biweeklyDate);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await generatePayrollCalculations(periodId, quincena);
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
      const response = await recalculatePayrollCalculations(periodId, quincena);
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

  const QUINCENA_OPTIONS: { value: Quincena; label: string }[] = [
    { value: null, label: "Mes completo" },
    { value: 1, label: "1ra quincena" },
    { value: 2, label: "2da quincena" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasBiweekly && onQuincenaChange && (
          <ButtonGroup>
            {QUINCENA_OPTIONS.map((opt) => (
              <Button
                key={String(opt.value)}
                type="button"
                size="sm"
                variant={quincena === opt.value ? "default" : "outline"}
                onClick={() => onQuincenaChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </ButtonGroup>
        )}

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
            Generar Cálculos de Nómina
          </Button>
        )}

        {hasCalculations && !isClosed && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowRecalcConfirm(true)}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-1.5" />
            )}
            Recalcular Nómina
          </Button>
        )}
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
