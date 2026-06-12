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
import { currentYear } from "@/core/core.function";

export default function PayrollRegisterPage() {
  const { ROUTE } = PAYROLL_REGISTER;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [year, setYear] = useState(String(currentYear()));
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const { data: companies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  const params = {
    year,
    ...(companyId ? { company_id: companyId } : {}),
    ...(periodId ? { period_id: periodId } : {}),
  };

  const { data, isLoading } = usePayrollRegister(params);

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

        <PayrollRegisterTable
          data={data?.data ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
