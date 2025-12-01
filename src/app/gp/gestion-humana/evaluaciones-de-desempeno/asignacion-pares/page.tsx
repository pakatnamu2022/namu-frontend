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
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAR_EVALUATOR } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.constant";
import { parEvaluatorColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorColumns";
import ParEvaluatorTable from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorTable";
import ParEvaluatorOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorOptions";
import { useWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  deleteParEvaluator,
  storeMultipleParEvaluators,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.actions";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { ParEvaluatorAddModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorAddModal";
import { ParEvaluatorSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.schema";

const { MODEL, ROUTE } = PAR_EVALUATOR;

export default function EvaluatorParPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useWorkers({
    page,
    search,
    per_page,
    status_id: STATUS_WORKER.ACTIVE,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteParEvaluator(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenAddModal = (workerId?: number) => {
    setSelectedWorkerId(workerId || null);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedWorkerId(null);
  };

  const handleSubmitAdd = async (data: ParEvaluatorSchema) => {
    setIsSubmitting(true);
    try {
      const payload = {
        worker_id: Number(data.worker_id),
        mate_ids: data.mate_ids,
      };
      await storeMultipleParEvaluators(payload);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await refetch();
      handleCloseAddModal();
    } catch (error: any) {
      errorToast(
        ERROR_MESSAGE(MODEL, "create", error?.response?.data?.message)
      );
    } finally {
      setIsSubmitting(false);
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
      </HeaderTableWrapper>
      <ParEvaluatorTable
        isLoading={isLoading}
        columns={parEvaluatorColumns({
          onDelete: setDeleteId,
          onAssign: handleOpenAddModal,
        })}
        data={data?.data || []}
      >
        <ParEvaluatorOptions search={search} setSearch={setSearch} />
      </ParEvaluatorTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {showAddModal && (
        <ParEvaluatorAddModal
          open={showAddModal}
          onOpenChange={handleCloseAddModal}
          workerId={selectedWorkerId}
          onSubmit={handleSubmitAdd}
          isSubmitting={isSubmitting}
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
