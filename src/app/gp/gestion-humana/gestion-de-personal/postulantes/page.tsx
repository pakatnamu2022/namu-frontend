"use client";

import { useEffect, useState } from "react";
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
import { APPLICANT } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import { useApplicants } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.hook";
import {
  changeApplicantStatus,
  deleteApplicant,
} from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.actions";
import { ApplicantResource } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.interface";
import { ApplicantStatusSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.schema";
import ApplicantActions from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantActions";
import ApplicantTable from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantTable";
import ApplicantOptions from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantOptions";
import ApplicantStatusDialog from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantStatusDialog";
import { applicantColumns } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantColumns";

export default function ApplicantPage() {
  const { MODEL, ROUTE } = APPLICANT;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusRow, setStatusRow] = useState<ApplicantResource | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useApplicants({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApplicant(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatus = async (values: ApplicantStatusSchema) => {
    if (!statusRow) return;
    setSavingStatus(true);
    try {
      await changeApplicantStatus(statusRow.id, {
        tipo_trabajador_id: Number(values.tipo_trabajador_id),
        motivo_status: values.motivo_status || undefined,
      });
      await refetch();
      successToast("Estado del postulante actualizado.");
      setStatusRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo actualizar el estado.",
      );
    } finally {
      setSavingStatus(false);
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
        <ApplicantActions />
      </HeaderTableWrapper>

      <ApplicantTable
        isLoading={isLoading}
        columns={applicantColumns({
          onStatus: setStatusRow,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <ApplicantOptions search={search} setSearch={setSearch} />
      </ApplicantTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="El postulante quedará anulado y dejará de mostrarse en el listado. ¿Deseas continuar?"
        />
      )}

      <ApplicantStatusDialog
        applicant={statusRow}
        open={statusRow !== null}
        onOpenChange={(open) => !open && setStatusRow(null)}
        onConfirm={handleStatus}
        isLoading={savingStatus}
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
