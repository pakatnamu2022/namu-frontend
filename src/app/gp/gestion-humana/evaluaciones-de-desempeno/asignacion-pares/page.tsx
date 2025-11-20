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
  findParEvaluatorById,
  updateParEvaluator,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.actions";
import { ParEvaluatorEditModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/components/ParEvaluatorEditModal";
import { ParEvaluatorSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/asignacion-pares/lib/par-evaluator.schema";

const { MODEL, ROUTE } = PAR_EVALUATOR;

export default function EvaluatorParPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<
    Partial<ParEvaluatorSchema> | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useWorkers({
    page,
    search,
    per_page,
  });

  const handleEdit = async (id: number, workerId: number) => {
    setEditingId(id);
    setEditingWorkerId(workerId);
    try {
      const parEvaluator = await findParEvaluatorById(id.toString());
      setEditingData({
        mate_id: parEvaluator.mate_id.toString(),
        worker_id: parEvaluator.worker_id.toString(),
      });
      setEditModalOpen(true);
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "fetch"));
    }
  };

  const handleSubmitEdit = async (data: ParEvaluatorSchema) => {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      await updateParEvaluator(editingId.toString(), data);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      setEditModalOpen(false);
      setEditingId(null);
      setEditingWorkerId(null);
      setEditingData(undefined);
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "update"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onEdit: handleEdit,
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

      <ParEvaluatorEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        parEvaluatorId={editingId}
        workerId={editingWorkerId}
        defaultValues={editingData}
        onSubmit={handleSubmitEdit}
        isSubmitting={isSubmitting}
      />

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
