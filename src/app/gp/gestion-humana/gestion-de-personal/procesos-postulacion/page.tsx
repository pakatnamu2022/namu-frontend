"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { RECRUITMENT_PROCESS } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.constant";
import { useRecruitmentProcesses } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.hook";
import {
  addDaysToRecruitmentProcesses,
  closeRecruitmentProcess,
  deleteRecruitmentProcess,
  pauseRecruitmentProcess,
  reopenRecruitmentProcess,
  resumeRecruitmentProcess,
} from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import { RecruitmentProcessResource } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.interface";
import { PauseProcessSchema, AddProcessDaysSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.schema";
import RecruitmentProcessActions from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessActions";
import RecruitmentProcessTable from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessTable";
import RecruitmentProcessOptions from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessOptions";
import { recruitmentProcessColumns } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessColumns";
import PauseProcessDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/PauseProcessDialog";
import AddProcessDaysDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/AddProcessDaysDialog";
import ProcessHistoryDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/ProcessHistoryDialog";

export default function RecruitmentProcessPage() {
  const { MODEL, ROUTE } = RECRUITMENT_PROCESS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [pauseRow, setPauseRow] = useState<RecruitmentProcessResource | null>(null);
  const [pausing, setPausing] = useState(false);
  const [historyRow, setHistoryRow] = useState<RecruitmentProcessResource | null>(null);
  const [addDaysOpen, setAddDaysOpen] = useState(false);
  const [addingDays, setAddingDays] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useRecruitmentProcesses({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecruitmentProcess(deleteId);
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

  const handleClose = async () => {
    if (!closeId) return;
    setClosing(true);
    try {
      await closeRecruitmentProcess(closeId);
      await refetch();
      successToast("Proceso finalizado correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo finalizar el proceso.",
      );
    } finally {
      setClosing(false);
      setCloseId(null);
    }
  };

  const handlePause = async ({ motivo }: PauseProcessSchema) => {
    if (!pauseRow) return;
    setPausing(true);
    try {
      await pauseRecruitmentProcess(pauseRow.id, motivo);
      await refetch();
      successToast("Proceso pausado correctamente.");
      setPauseRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo pausar el proceso.",
      );
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async (id: number) => {
    try {
      await resumeRecruitmentProcess(id);
      await refetch();
      successToast("Proceso reanudado correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo reanudar el proceso.",
      );
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await reopenRecruitmentProcess(id);
      await refetch();
      successToast("Proceso reabierto correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo reabrir el proceso.",
      );
    }
  };

  const handleAddDays = async (data: AddProcessDaysSchema) => {
    setAddingDays(true);
    try {
      await addDaysToRecruitmentProcesses({
        proceso_postulacion_ids: data.proceso_postulacion_ids.map(Number),
        dias: Number(data.dias),
        motivo: data.motivo,
      });
      await refetch();
      successToast("Días agregados correctamente.");
      setAddDaysOpen(false);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudieron agregar los días.",
      );
    } finally {
      setAddingDays(false);
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
        <RecruitmentProcessActions onAddDays={() => setAddDaysOpen(true)} />
      </HeaderTableWrapper>

      <RecruitmentProcessTable
        isLoading={isLoading}
        columns={recruitmentProcessColumns({
          onClose: setCloseId,
          onDelete: setDeleteId,
          onPause: setPauseRow,
          onResume: handleResume,
          onReopen: handleReopen,
          onHistory: setHistoryRow,
        })}
        data={data?.data || []}
      >
        <RecruitmentProcessOptions search={search} setSearch={setSearch} />
      </RecruitmentProcessTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="El proceso quedará anulado y dejará de mostrarse en el listado. ¿Deseas continuar?"
        />
      )}

      {closeId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCloseId(null)}
          onConfirm={handleClose}
          title="Finalizar proceso"
          description="El proceso se marcará como cerrado y no podrá editarse. ¿Deseas continuar?"
          confirmText="Finalizar"
          icon="success"
          isLoading={closing}
        />
      )}

      <PauseProcessDialog
        process={pauseRow}
        open={pauseRow !== null}
        onOpenChange={(open) => !open && setPauseRow(null)}
        onConfirm={handlePause}
        isLoading={pausing}
      />

      <AddProcessDaysDialog
        open={addDaysOpen}
        onOpenChange={setAddDaysOpen}
        onConfirm={handleAddDays}
        isLoading={addingDays}
      />

      <ProcessHistoryDialog
        process={historyRow}
        open={historyRow !== null}
        onOpenChange={(open) => !open && setHistoryRow(null)}
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
