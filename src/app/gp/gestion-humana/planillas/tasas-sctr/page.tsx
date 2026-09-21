"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { DataTable } from "@/shared/components/DataTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { SCTR_RATE } from "@/features/gp/gestionhumana/planillas/tasas-sctr/lib/sctr-rate.constants";
import { useSctrRates } from "@/features/gp/gestionhumana/planillas/tasas-sctr/lib/sctr-rate.hook";
import { sctrRateColumns } from "@/features/gp/gestionhumana/planillas/tasas-sctr/components/SctrRateColumns";
import SctrRateModal from "@/features/gp/gestionhumana/planillas/tasas-sctr/components/SctrRateModal";

const { MODEL, ROUTE } = SCTR_RATE;

export default function SctrRatePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [companyId, setCompanyId] = useState("");
  const [open, setOpen] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  useEffect(() => {
    setPage(1);
  }, [per_page, companyId]);

  const { data, isLoading } = useSctrRates({
    page,
    per_page,
    company_id: companyId || undefined,
  });

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
        <ActionsWrapper>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
          </Button>
        </ActionsWrapper>
      </HeaderTableWrapper>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={sctrRateColumns()}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <SearchableSelect
              options={(companies ?? []).map((c) => ({
                label: c.name,
                value: String(c.id),
              }))}
              value={companyId}
              onChange={setCompanyId}
              placeholder={isLoadingCompanies ? "Cargando..." : "Empresa"}
              disabled={isLoadingCompanies}
              allowClear={false}
              classNameDiv="w-56"
            />
          </div>
        </DataTable>
      </div>

      {open && (
        <SctrRateModal
          open={open}
          onClose={() => setOpen(false)}
          defaultCompanyId={companyId}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
