"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import ExcludedActions from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/components/ExcludedActions";
import ExcludedTable from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/components/ExcludedTable";
import ExcludedOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/components/ExcludedOptions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { excludedColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/components/ExcludedColumns";
import { deleteEvaluationPersonDetail } from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/lib/excluded.actions";
import { useExcluded } from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/lib/excluded.hook";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { EXCLUDED } from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/lib/excluded.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from '@/app/not-found';


const { MODEL } = EXCLUDED;

export default function ExcludedasPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useExcluded({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvaluationPersonDetail(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("excluidos")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ExcludedActions />
      </HeaderTableWrapper>
      <ExcludedTable
        isLoading={isLoading}
        columns={excludedColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <ExcludedOptions search={search} setSearch={setSearch} />
      </ExcludedTable>

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
