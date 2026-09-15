"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DataTable } from "@/shared/components/DataTable";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import { APPLICANT } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import { useApplicantDataChanges } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicantDataChange.hook";
import {
  approveApplicantDataChange,
  rejectApplicantDataChange,
} from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicantDataChange.actions";
import { ApplicantDataChangeResource } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicantDataChange.interface";
import { ApplicantDataChangeRejectSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicantDataChange.schema";
import { applicantDataChangeColumns } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantDataChangeColumns";
import RejectApplicantDataChangeDialog from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/RejectApplicantDataChangeDialog";

export default function ApplicantDataChangeQueuePage() {
  const { ROUTE, ABSOLUTE_ROUTE } = APPLICANT;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [rejectRow, setRejectRow] = useState<ApplicantDataChangeResource | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [per_page]);

  const { data, isLoading, refetch } = useApplicantDataChanges({
    page,
    per_page,
  });

  const handleApprove = async (row: ApplicantDataChangeResource) => {
    try {
      await approveApplicantDataChange(row.id);
      await refetch();
      successToast("Cambios de ficha aprobados y fusionados al postulante.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo aprobar el cambio.",
      );
    }
  };

  const handleReject = async (values: ApplicantDataChangeRejectSchema) => {
    if (!rejectRow) return;
    setSaving(true);
    try {
      await rejectApplicantDataChange(rejectRow.id, values.motivo);
      await refetch();
      successToast("Cambio de ficha rechazado.");
      setRejectRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo rechazar el cambio.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Cola de aprobación de ficha"
          subtitle="Cambios que los postulantes enviaron desde su portal y esperan revisión de RRHH."
          icon="ShieldCheck"
          backRoute={ABSOLUTE_ROUTE}
        />
      </HeaderTableWrapper>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={applicantDataChangeColumns({
            onApprove: handleApprove,
            onReject: setRejectRow,
          })}
          data={data?.data || []}
          isLoading={isLoading}
        />
      </div>

      <RejectApplicantDataChangeDialog
        change={rejectRow}
        open={rejectRow !== null}
        onOpenChange={(open) => !open && setRejectRow(null)}
        onConfirm={handleReject}
        isLoading={saving}
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
