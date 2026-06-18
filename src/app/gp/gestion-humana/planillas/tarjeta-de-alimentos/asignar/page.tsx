"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useFoodCards } from "@/features/gp/gestionhumana/planillas/food-cards/lib/food-card.hook";
import FoodCardAssignTable from "@/features/gp/gestionhumana/planillas/food-cards/components/FoodCardAssignTable";
import { FOOD_CARD } from "@/features/gp/gestionhumana/planillas/food-cards/lib/food-card.constant";
import { Option } from "@/core/core.interface";
import { generateYear, currentYear } from "@/core/core.function";
import { useSearchParams } from "react-router-dom";
import SearchInput from "@/shared/components/SearchInput";
import { EMPRESA_TP, FILTER_YEAR_START } from "@/core/core.constants";
import { PayrollPeriodResource } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.interface";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import BackButton from "@/shared/components/BackButton";

export default function AssignFoodCardPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = FOOD_CARD;
  const { currentView, checkRouteExists } = useCurrentModule();
  const [searchParams] = useSearchParams();

  const [companyId, setCompanyId] = useState(
    searchParams.get("companyId") ?? String(EMPRESA_TP.id),
  );
  const [year, setYear] = useState(
    searchParams.get("year") ?? String(currentYear()),
  );
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const { data: companies = [], isLoading: isLoadingCompanies } =
    useAllCompanies();

  const companyOptions: Option[] = companies.map((c) => ({
    label: c.name,
    value: String(c.id),
  }));

  const yearOptions: Option[] = generateYear(FILTER_YEAR_START).map((y) => ({
    label: String(y),
    value: String(y),
  }));

  const canFetch = !!companyId && !!year;

  const { data: periodsData, isLoading: isLoadingPeriods } = usePayrollPeriods(
    canFetch ? { year, company_id: companyId } : undefined,
  );

  const allPeriods: PayrollPeriodResource[] = (periodsData?.data ?? []).sort(
    (a, b) => a.month - b.month,
  );

  const activePeriods =
    selectedPeriodIds.length > 0
      ? allPeriods.filter((p) => selectedPeriodIds.includes(String(p.id)))
      : allPeriods;

  const { data: workersData, isLoading: isLoadingWorkers } = useAllWorkers(
    canFetch
      ? {
          cargo_id: POSITION_TYPE.TRACTOR_TRUCK_DRIVER,
          status_id: STATUS_WORKER.ACTIVE,
          sede$empresa_id: companyId,
        }
      : undefined,
    canFetch,
  );

  const workers = workersData ?? [];

  const periodIds = activePeriods.map((p) => p.id);

  const {
    data: foodCardsData,
    isLoading: isLoadingCards,
    refetch,
  } = useFoodCards(
    canFetch && periodIds.length > 0
      ? { company_id: companyId, "period_id[]": periodIds }
      : undefined,
  );

  const existingCards = foodCardsData?.data ?? [];

  const isTableLoading = isLoadingWorkers || isLoadingPeriods || isLoadingCards;

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <BackButton
          size="icon"
          name="Cotización Mesón"
          route={ABSOLUTE_ROUTE}
        />

        <TitleFormComponent title={currentView.descripcion} mode="create" />
      </HeaderTableWrapper>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Empresa</span>
          <SearchableSelect
            options={companyOptions}
            value={companyId}
            onChange={(val) => {
              setCompanyId(val);
              setSelectedPeriodIds([]);
            }}
            placeholder={isLoadingCompanies ? "Cargando..." : "Empresa"}
            disabled={isLoadingCompanies}
            allowClear={false}
            classNameDiv="w-56"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Año</span>
          <SearchableSelect
            options={yearOptions}
            value={year}
            onChange={(val) => {
              setYear(val);
              setSelectedPeriodIds([]);
            }}
            placeholder="Año"
            allowClear={false}
            showSearch={false}
            classNameDiv="w-28"
          />
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar trabajador..."
        />
      </div>

      <FoodCardAssignTable
        workers={workers}
        periods={activePeriods}
        existingCards={existingCards}
        isLoading={isTableLoading}
        onSaved={refetch}
        search={search}
      />
    </FormWrapper>
  );
}
