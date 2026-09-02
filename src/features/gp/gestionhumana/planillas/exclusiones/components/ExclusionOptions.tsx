"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { generateYear } from "@/core/core.function";
import { FILTER_YEAR_START } from "@/core/core.constants";
import { Option } from "@/core/core.interface";
import { PAYROLL_EXCLUSION, EXCLUSION_CONCEPTS } from "../lib/exclusion.constants";

const { MODEL } = PAYROLL_EXCLUSION;

interface Props {
  search: string;
  setSearch: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  companyId: string;
  setCompanyId: (value: string) => void;
  periodId: string;
  setPeriodId: (value: string) => void;
  concept: string;
  setConcept: (value: string) => void;
}

export default function ExclusionOptions({
  search,
  setSearch,
  year,
  setYear,
  companyId,
  setCompanyId,
  periodId,
  setPeriodId,
  concept,
  setConcept,
}: Props) {
  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();

  const companyOptions: Option[] = (companies ?? []).map((c) => ({
    label: c.name,
    value: String(c.id),
  }));

  const yearOptions: Option[] = generateYear(FILTER_YEAR_START).map((y) => ({
    label: String(y),
    value: String(y),
  }));

  const canSelectPeriod = !!year && !!companyId;

  const { data: periodsData, isLoading: isLoadingPeriods } = usePayrollPeriods(
    canSelectPeriod ? { year, company_id: companyId } : undefined,
  );

  const periodOptions: Option[] = (periodsData?.data ?? []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Buscar ${MODEL.plural}...`}
      />

      <SearchableSelect
        options={companyOptions}
        value={companyId}
        onChange={(val) => {
          setCompanyId(val);
          setPeriodId("");
        }}
        placeholder={isLoadingCompanies ? "Cargando..." : "Empresa"}
        disabled={isLoadingCompanies}
        allowClear={false}
        classNameDiv="w-48"
      />

      <SearchableSelect
        options={yearOptions}
        value={year}
        onChange={(val) => {
          setYear(val);
          setPeriodId("");
        }}
        placeholder="Año"
        allowClear={false}
        showSearch={false}
        classNameDiv="w-28"
      />

      <SearchableSelect
        options={periodOptions}
        value={periodId}
        onChange={setPeriodId}
        placeholder={
          !canSelectPeriod
            ? "Seleccione empresa y año"
            : isLoadingPeriods
              ? "Cargando..."
              : "Periodo"
        }
        disabled={!canSelectPeriod || isLoadingPeriods}
        classNameDiv="w-52"
      />

      <SearchableSelect
        options={EXCLUSION_CONCEPTS}
        value={concept}
        onChange={setConcept}
        placeholder="Concepto"
        classNameDiv="w-52"
      />
    </div>
  );
}
