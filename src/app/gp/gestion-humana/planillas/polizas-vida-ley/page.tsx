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
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { LIFE_POLICY } from "@/features/gp/gestionhumana/planillas/polizas-vida-ley/lib/life-policy.constants";
import { useLifePolicies } from "@/features/gp/gestionhumana/planillas/polizas-vida-ley/lib/life-policy.hook";
import { lifePolicyColumns } from "@/features/gp/gestionhumana/planillas/polizas-vida-ley/components/LifePolicyColumns";
import LifePolicyModal from "@/features/gp/gestionhumana/planillas/polizas-vida-ley/components/LifePolicyModal";
import LifePolicyDetailModal from "@/features/gp/gestionhumana/planillas/polizas-vida-ley/components/LifePolicyDetailModal";

const { MODEL, ROUTE } = LIFE_POLICY;

export default function LifePolicyPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, companyId]);

  const { data, isLoading } = useLifePolicies({
    page,
    per_page,
    search,
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
          columns={lifePolicyColumns({ onView: setDetailId })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={`Buscar ${MODEL.plural}...`}
            />
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
        <LifePolicyModal
          open={open}
          onClose={() => setOpen(false)}
          defaultCompanyId={companyId}
        />
      )}
      {detailId !== null && (
        <LifePolicyDetailModal
          policyId={detailId}
          onClose={() => setDetailId(null)}
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
