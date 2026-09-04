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
  closeRecruitmentProcess,
  deleteRecruitmentProcess,
} from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import RecruitmentProcessActions from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessActions";
import RecruitmentProcessTable from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessTable";
import RecruitmentProcessOptions from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessOptions";
import { recruitmentProcessColumns } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessColumns";

export default function RecruitmentProcessPage() {
  const { MODEL, ROUTE } = RECRUITMENT_PROCESS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

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
        <RecruitmentProcessActions />
      </HeaderTableWrapper>

      <RecruitmentProcessTable
        isLoading={isLoading}
        columns={recruitmentProcessColumns({
          onClose: setCloseId,
          onDelete: setDeleteId,
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
