"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { usePeriods } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.hook";
import PeriodActions from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodActions";
import PeriodTable from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodTable";
import { periodColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodColumns";
import PeriodOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/components/PeriodOptions";
import { deletePeriod } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { PERIOD } from "@/features/gp/gestionhumana/evaluaciondesempeño/periodos/lib/period.constans";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from "@/app/not-found";


const { MODEL } = PERIOD;

export default function PeriodosPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePeriods({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePeriod(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("periodos")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PeriodActions />
      </HeaderTableWrapper>
      <PeriodTable
        isLoading={isLoading}
        columns={periodColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <PeriodOptions search={search} setSearch={setSearch} />
      </PeriodTable>

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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
