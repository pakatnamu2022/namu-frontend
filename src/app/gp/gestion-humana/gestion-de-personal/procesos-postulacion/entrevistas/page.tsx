"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { RECRUITMENT_PROCESS } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.constant";
import { findRecruitmentProcessById } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import { INTERVIEW } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/interview.constant";
import { useInterviews } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/interview.hook";
import {
  deleteInterview,
  scoreInterview,
  storeInterview,
  syncProcessCompetences,
} from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/interview.actions";
import { InterviewResource } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/interview.interface";
import { InterviewSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/interview.schema";
import InterviewTable from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/InterviewTable";
import { interviewColumns } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/InterviewColumns";
import InterviewFormDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/InterviewFormDialog";
import InterviewScoreDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/InterviewScoreDialog";
import ProcessCompetencesDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/ProcessCompetencesDialog";

export default function ProcessInterviewsPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const procesoId = searchParams.get("proceso_id");

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scoreRow, setScoreRow] = useState<InterviewResource | null>(null);
  const [scoring, setScoring] = useState(false);
  const [competencesOpen, setCompetencesOpen] = useState(false);
  const [savingCompetences, setSavingCompetences] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  useEffect(() => {
    if (!isLoadingModule && checkRouteExists(ROUTE) && !procesoId) {
      navigate(ABSOLUTE_ROUTE, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procesoId, isLoadingModule]);

  const { data: process, isLoading: isLoadingProcess } = useQuery({
    queryKey: [RECRUITMENT_PROCESS.QUERY_KEY, procesoId],
    queryFn: () => findRecruitmentProcessById(procesoId as string),
    enabled: !!procesoId,
    refetchOnWindowFocus: false,
  });

  const { data, isLoading, refetch } = useInterviews({
    page,
    search,
    per_page,
    proceso_postulacion_id: procesoId ?? undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInterview(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(INTERVIEW.MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(INTERVIEW.MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreate = async (data: InterviewSchema) => {
    setCreating(true);
    try {
      await storeInterview({
        ...data,
        proceso_postulacion_id: Number(procesoId),
        persona_id: Number(data.persona_id),
        entrevistador_id: data.entrevistador_id ? Number(data.entrevistador_id) : undefined,
      });
      await refetch();
      successToast("Entrevista registrada correctamente.");
      setFormOpen(false);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo registrar la entrevista.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleScore = async (scores: { sub_competencia_id: number; puntaje: number }[]) => {
    if (!scoreRow) return;
    setScoring(true);
    try {
      await scoreInterview(scoreRow.id, scores);
      await refetch();
      successToast("Calificación guardada correctamente.");
      setScoreRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo guardar la calificación.",
      );
    } finally {
      setScoring(false);
    }
  };

  const handleSyncCompetences = async (subCompetencias: { id: number; orden: number }[]) => {
    if (!process) return;
    setSavingCompetences(true);
    try {
      await syncProcessCompetences(process.id, subCompetencias);
      successToast("Subcompetencias actualizadas correctamente.");
      setCompetencesOpen(false);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudieron guardar las subcompetencias.",
      );
    } finally {
      setSavingCompetences(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!procesoId) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Entrevistas del proceso"
          subtitle={
            isLoadingProcess
              ? "Cargando proceso..."
              : process
                ? `${process.nombre_postulacion} · ${process.sede ?? "-"} · ${process.cargo ?? "-"}`
                : "Proceso no encontrado"
          }
          icon="MessageSquareQuote"
          backRoute={ABSOLUTE_ROUTE}
        />
        <ActionsWrapper>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCompetencesOpen(true)}
          >
            <ListChecks className="size-4 mr-2" /> Subcompetencias
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="size-4 mr-2" /> Nueva Entrevista
          </Button>
        </ActionsWrapper>
      </HeaderTableWrapper>

      <InterviewTable
        isLoading={isLoading}
        columns={interviewColumns({
          onScore: setScoreRow,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar entrevista..." />
      </InterviewTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="La entrevista y sus calificaciones se eliminarán. ¿Deseas continuar?"
        />
      )}

      <InterviewFormDialog
        processId={procesoId ? Number(procesoId) : null}
        open={formOpen}
        onOpenChange={setFormOpen}
        onConfirm={handleCreate}
        isLoading={creating}
      />

      <InterviewScoreDialog
        interview={scoreRow}
        open={scoreRow !== null}
        onOpenChange={(open) => !open && setScoreRow(null)}
        onConfirm={handleScore}
        isLoading={scoring}
      />

      <ProcessCompetencesDialog
        process={process ?? null}
        open={competencesOpen}
        onOpenChange={setCompetencesOpen}
        onConfirm={handleSyncCompetences}
        isLoading={savingCompetences}
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
