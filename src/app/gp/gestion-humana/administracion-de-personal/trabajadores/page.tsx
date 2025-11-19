"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import WorkerOptions from "@/features/gp/gestionhumana/personal/trabajadores/components/WorkerOptions";
import WorkerTable from "@/features/gp/gestionhumana/personal/trabajadores/components/WorkerTable";
import WorkerActions from "@/features/gp/gestionhumana/personal/trabajadores/components/WorkerActions";
import { workerColumns } from "@/features/gp/gestionhumana/personal/trabajadores/components/WorkerColumns";
import { deleteWorker } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.actions";
import { useWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { WORKER } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.constant";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

const { MODEL, ROUTE } = WORKER;

export default function WorkersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useWorkers({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorker(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <WorkerActions />
      </HeaderTableWrapper>
      <WorkerTable
        isLoading={isLoading}
        columns={workerColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <WorkerOptions search={search} setSearch={setSearch} />
      </WorkerTable>

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
