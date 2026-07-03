"use client";

import { useParams } from "react-router-dom";
import type { RowSelectionState } from "@tanstack/react-table";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageWrapper from "@/shared/components/PageWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import {
  useEvaluation,
  useEvaluationCompetenceDetails,
  usePersonsInEvaluation,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { destroyManyPersonCompetenceDetails } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.actions";
import { useAllCompetences } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.hook";
import EvaluationCompetenceDetailTable from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationCompetenceDetailTable";
import { EvaluationCompetenceDetailColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationCompetenceDetailColumns";
import EvaluationCompetenceDetailOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/EvaluationCompetenceDetailOptions";
import { DeletePersonCompetenceDetailDialog } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/components/DeletePersonCompetenceDetailDialog";

const { ROUTE } = EVALUATION;

export default function EvaluationCompetenceDetailPage() {
  const { id } = useParams();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [personId, setPersonId] = useState<string | null>(null);
  const [competenceId, setCompetenceId] = useState<string | null>(null);
  const [evaluatorType, setEvaluatorType] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openDelete, setOpenDelete] = useState(false);

  const idEvaluation = Number(id);

  useEffect(() => {
    setPage(1);
  }, [search, personId, competenceId, evaluatorType, per_page]);

  useEffect(() => {
    setRowSelection({});
  }, [search, personId, competenceId, evaluatorType, page, per_page]);

  const { data: evaluation } = useEvaluation(idEvaluation);

  const { data, isLoading, refetch } = useEvaluationCompetenceDetails(
    idEvaluation,
    {
      page,
      search,
      person_id: personId,
      competence_id: competenceId,
      evaluatorType,
      per_page,
    },
  );

  const { data: persons = [], isLoading: isLoadingPersons } =
    usePersonsInEvaluation(idEvaluation);

  const { data: competences = [], isLoading: isLoadingCompetences } =
    useAllCompetences();

  const selectedIds = Object.keys(rowSelection).map(Number);
  const selectedRecords = (data?.data || []).filter(
    (record) => rowSelection[String(record.id)],
  );

  const handleDelete = async (cascade: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await destroyManyPersonCompetenceDetails(
        selectedIds,
        cascade,
      );
      await refetch();
      setRowSelection({});
      successToast(
        response.message || "Detalles de competencia eliminados correctamente.",
      );
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          "Error al eliminar los detalles de competencia.",
      );
    } finally {
      setOpenDelete(false);
    }
  };

  if (isLoadingModule || isLoadingPersons || isLoadingCompetences || !evaluation)
    return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!idEvaluation) notFound();

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Competencias por Colaborador"
          subtitle={evaluation?.name}
          icon={currentView.icon}
        />

        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            color="red"
            size="sm"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="size-4" />
            Eliminar ({selectedIds.length})
          </Button>
        )}
      </HeaderTableWrapper>

      <EvaluationCompetenceDetailTable
        isLoading={isLoading}
        columns={EvaluationCompetenceDetailColumns()}
        data={data?.data || []}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <EvaluationCompetenceDetailOptions
          search={search}
          setSearch={setSearch}
          persons={persons}
          personId={personId}
          setPersonId={setPersonId}
          competences={competences}
          competenceId={competenceId}
          setCompetenceId={setCompetenceId}
          evaluatorType={evaluatorType}
          setEvaluatorType={setEvaluatorType}
        />
      </EvaluationCompetenceDetailTable>

      <DeletePersonCompetenceDetailDialog
        open={openDelete}
        records={selectedRecords}
        onOpenChange={setOpenDelete}
        onConfirm={handleDelete}
      />

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </PageWrapper>
  );
}
