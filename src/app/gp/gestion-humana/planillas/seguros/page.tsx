"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useInsurances } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.hook";
import InsuranceTable from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceTable";
import { insuranceColumns } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceColumns";
import InsuranceOptions from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceOptions";
import InsuranceActions from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteInsurance } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";

export default function InsurancePage() {
  const { MODEL, ROUTE } = INSURANCE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useInsurances({ page, per_page, search });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInsurance(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
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
        <InsuranceActions />
      </HeaderTableWrapper>

      <InsuranceTable
        isLoading={isLoading}
        columns={insuranceColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <InsuranceOptions search={search} setSearch={setSearch} />
      </InsuranceTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
