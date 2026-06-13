"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { usePayrollRegister } from "@/features/gp/gestionhumana/planillas/payroll-register/lib/payroll-register.hook";
import PayrollRegisterTable from "@/features/gp/gestionhumana/planillas/payroll-register/components/PayrollRegisterTable";
import PayrollRegisterOptions from "@/features/gp/gestionhumana/planillas/payroll-register/components/PayrollRegisterOptions";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_REGISTER } from "@/features/gp/gestionhumana/planillas/payroll-register/lib/payroll-register.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { currentYear, errorToast, successToast } from "@/core/core.function";
import {
  generatePayrollRegister,
  exportPayrollRegister,
} from "@/features/gp/gestionhumana/planillas/payroll-register/lib/payroll-register.actions";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, FileDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function PayrollRegisterPage() {
  const { ROUTE, QUERY_KEY } = PAYROLL_REGISTER;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const queryClient = useQueryClient();

  const [year, setYear] = useState(String(currentYear()));
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: companies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  const params = {
    year,
    ...(companyId ? { period$company_id: companyId } : {}),
    ...(periodId ? { period_id: periodId } : {}),
  };

  const { data, isLoading } = usePayrollRegister(params);

  const canGenerate = !!companyId && !!periodId;

  const selectedCompanyName =
    companies?.find((c) => String(c.id) === companyId)?.name ?? "";

  const handleExport = async () => {
    if (!periodId) return;
    setIsExporting(true);
    try {
      const blob = await exportPayrollRegister(Number(periodId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planilla-${periodId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al exportar la planilla",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!companyId || !periodId) return;
    setIsGenerating(true);
    try {
      await generatePayrollRegister({
        company_id: Number(companyId),
        period_id: Number(periodId),
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Planilla generada correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al generar la planilla",
      );
    } finally {
      setIsGenerating(false);
      setGenerateOpen(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={!periodId || isExporting}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileDown className="size-4" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button
            onClick={() => setGenerateOpen(true)}
            disabled={!canGenerate}
            size="sm"
            className="gap-2"
          >
            <Sparkles className="size-4" />
            Generar Planilla
          </Button>
        </div>
      </HeaderTableWrapper>

      <div className="rounded-md border border-border bg-card p-3 space-y-3">
        <PayrollRegisterOptions
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={(val) => {
            setPeriodId(val);
          }}
        />

        <PayrollRegisterTable data={data?.data ?? []} isLoading={isLoading} />
      </div>

      <SimpleConfirmDialog
        open={generateOpen}
        onOpenChange={(open) => !isGenerating && setGenerateOpen(open)}
        onConfirm={handleGenerate}
        title="Generar Planilla"
        description={
          selectedCompanyName
            ? `Se generará la planilla para ${selectedCompanyName} con el periodo seleccionado. Si ya existe información, será reemplazada.`
            : "Se generará la planilla para el periodo seleccionado. Si ya existe información, será reemplazada."
        }
        confirmText="Generar"
        cancelText="Cancelar"
        icon="success"
        isLoading={isGenerating}
      />
    </div>
  );
}
