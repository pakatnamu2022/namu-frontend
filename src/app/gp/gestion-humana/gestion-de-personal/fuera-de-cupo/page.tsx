"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import {
  APPLICANT_TYPE,
  OUT_OF_QUOTA_ROUTE,
} from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import { useApplicants } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.hook";
import { repostApplicant } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.actions";
import { ApplicantResource } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.interface";
import { ApplicantRepostSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.schema";
import ApplicantTable from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantTable";
import ApplicantOptions from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantOptions";
import RepostApplicantDialog from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/RepostApplicantDialog";
import { applicantColumns } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantColumns";

export default function OutOfQuotaApplicantsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [repostRow, setRepostRow] = useState<ApplicantResource | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useApplicants({
    page,
    search,
    per_page,
    tipo_trabajador_id: APPLICANT_TYPE.FUERA_CUPO,
  });

  const handleRepost = async (values: ApplicantRepostSchema) => {
    if (!repostRow) return;
    setSaving(true);
    try {
      await repostApplicant(
        repostRow.id,
        Number(values.proceso_postulacion_id),
      );
      await refetch();
      successToast("Postulante repostulado al nuevo proceso.");
      setRepostRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo repostular al postulante.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(OUT_OF_QUOTA_ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Postulantes aptos pero sin vacante disponible. Se pueden repostular a un nuevo proceso."
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <ApplicantTable
        isLoading={isLoading}
        columns={applicantColumns({
          onStatus: () => {},
          onDelete: () => {},
          onRepost: setRepostRow,
        })}
        data={data?.data || []}
      >
        <ApplicantOptions search={search} setSearch={setSearch} />
      </ApplicantTable>

      <RepostApplicantDialog
        applicant={repostRow}
        open={repostRow !== null}
        onOpenChange={(open) => !open && setRepostRow(null)}
        onConfirm={handleRepost}
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
