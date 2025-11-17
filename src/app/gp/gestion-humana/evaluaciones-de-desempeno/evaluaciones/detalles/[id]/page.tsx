"use client";

import { useParams } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { Badge } from "@/components/ui/badge";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import {
  useEvaluation,
  usePersonsInEvaluation,
  usePositionsInEvaluation,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { deleteEvaluationPersonDetail } from "@/features/gp/gestionhumana/evaluaciondesempeño/excluidos/lib/excluded.actions";
import EvaluationPersonActions from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonActions";
import EvaluationPersonTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonTable";
import { EvaluationPersonColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonColumns";
import EvaluationPersonOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonOptions";
import { EvaluationPersonResultModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EvaluationPersonResultModal";
import { useQueryClient } from "@tanstack/react-query";
import { useEvaluationPersonResult } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { WorkerResource } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";
import { regenerateEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.actions";
import { regenerateEvaluationPerson } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.actions";
import NotFound from '@/app/not-found';


const { ROUTE } = EVALUATION;

export default function EvaluationPersonPage() {
    const { id } = useParams();
  const queryClient = useQueryClient();
  // const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [personId, setPersonId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerResource | null>(
    null
  );
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingRegenerate, setLoadingRegenerate] = useState(false);

  const idEvaluation = Number(id);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data: evaluation } = useEvaluation(idEvaluation);

  const { data, isLoading, refetch } = useEvaluationPersonResult({
    evaluation_id: idEvaluation,
    page,
    search,
    person_id: personId,
    person$cargo_id: positionId,
    per_page,
  });

  const { data: persons, isLoading: isLoadingPersons } =
    usePersonsInEvaluation(idEvaluation);

  const { data: positions = [], isLoading: isLoadingPositions } =
    usePositionsInEvaluation(idEvaluation);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvaluationPersonDetail(deleteId);
      await refetch();
      successToast("Detalle de Ciclo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el objetivo.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleRegenerate = async (params: {
    mode: "full_reset" | "sync_with_cycle" | "add_missing_only";
    reset_progress?: boolean;
    force?: boolean;
  }) => {
    setLoadingRegenerate(true);
    try {
      await regenerateEvaluation(idEvaluation, params).then(
        (data: { message?: string }) => {
          successToast(data.message ?? "Evaluación regenerada correctamente.");
        }
      );
      await refetch();
      setLoadingRegenerate(false);
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? "Error al regenerar la evaluación."
      );
      setLoadingRegenerate(false);
    }
  };

  const handleRegenerateOne = async (
    person_id: number,
    evaluation_id: number
  ) => {
    try {
      await regenerateEvaluationPerson(person_id, evaluation_id).then(
        async (data) => {
          successToast(data.message ?? "Evaluación regenerada correctamente.");
          await refetch();
        }
      );
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? "Error al regenerar la evaluación."
      );
    }
  };

  if (isLoadingModule || isLoadingPersons || isLoadingPositions)
    return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;
  if (!idEvaluation) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Evaluación " + evaluation?.typeEvaluationName}
          icon={currentView.icon}
        >
          <Badge className="truncate" variant={"secondary"}>
            {evaluation?.name}
          </Badge>
        </TitleComponent>

        <EvaluationPersonActions
          idEvaluation={idEvaluation}
          loadingRegenerate={loadingRegenerate}
          handleRegenerate={handleRegenerate}
        />
      </HeaderTableWrapper>

      <EvaluationPersonTable
        isLoading={isLoading}
        columns={EvaluationPersonColumns({
          onRegenerate: handleRegenerateOne,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <EvaluationPersonOptions
          search={search}
          setSearch={setSearch}
          persons={persons || []}
          personId={personId}
          setPersonId={setPersonId}
          positions={positions}
          positionId={positionId}
          setPositionId={setPositionId}
        />
      </EvaluationPersonTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {selectedWorker && openDetailModal && (
        <EvaluationPersonResultModal
          queryClient={queryClient}
          open={openDetailModal}
          setOpen={(o) => {
            setOpenDetailModal(o);
            if (!o) {
              setTimeout(() => setSelectedWorker(null), 220);
            }
          }}
          person={selectedWorker}
          evaluation_id={Number(idEvaluation)}
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
