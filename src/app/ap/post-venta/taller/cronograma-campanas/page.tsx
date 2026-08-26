"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  DEFAULT_PER_PAGE,
  EMPRESA_AP,
  MONTH_OPTIONS,
} from "@/core/core.constants";
import {
  currentMonth,
  currentYear,
  generateYear,
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { notFound } from "@/shared/hooks/useNotFound";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { CAMPAIGN_SCHEDULE } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.constants";
import { useCampaignSchedule } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.hook";
import { deleteCampaignSchedule } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.actions";
import CampaignScheduleActions from "@/features/ap/post-venta/taller/cronograma-campanas/components/CampaignScheduleActions";
import CampaignScheduleTable from "@/features/ap/post-venta/taller/cronograma-campanas/components/CampaignScheduleTable";
import CampaignScheduleOptions from "@/features/ap/post-venta/taller/cronograma-campanas/components/CampaignScheduleOptions";
import { campaignScheduleColumns } from "@/features/ap/post-venta/taller/cronograma-campanas/components/CampaignScheduleColumns";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";

export default function CampaignSchedulePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(currentYear().toString());
  const [month, setMonth] = useState(currentMonth().toString());
  const [sedeId, setSedeId] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = CAMPAIGN_SCHEDULE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, year, month, sedeId, per_page]);

  const { data: mySedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });

  useEffect(() => {
    if (mySedes.length > 0 && !sedeId) {
      setSedeId(mySedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySedes, sedeId]);

  const { data, isLoading, refetch } = useCampaignSchedule({
    params: {
      page,
      search,
      per_page,
      year,
      month,
      sede_id: sedeId || undefined,
    },
    enabled: !!sedeId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCampaignSchedule(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule || isLoadingSedes) return <PageSkeleton />;
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
        <CampaignScheduleActions permissions={permissions} />
      </HeaderTableWrapper>
      <CampaignScheduleTable
        isLoading={isLoading}
        columns={campaignScheduleColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <CampaignScheduleOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTH_OPTIONS}
          sedes={mySedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
        />
      </CampaignScheduleTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
