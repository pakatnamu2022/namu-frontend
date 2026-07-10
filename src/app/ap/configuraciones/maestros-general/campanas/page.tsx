"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import CampaignActions from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignActions";
import CampaignTable from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignTable";
import { campaignColumns } from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignColumns";
import CampaignOptions from "@/features/ap/configuraciones/maestros-general/campanas/components/CampaignOptions";
import { useCampaign } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.hook";
import {
  deleteCampaign,
  updateCampaign,
} from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.actions";
import { CAMPAIGN } from "@/features/ap/configuraciones/maestros-general/campanas/lib/campaign.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function CampaignPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<string>("");
  const [discountType, setDiscountType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const { MODEL, ROUTE } = CAMPAIGN;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, areaId, discountType, status]);

  const { data, isLoading, refetch } = useCampaign({
    page,
    search,
    per_page,
    area_id: areaId,
    discount_type: discountType,
    status: status,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateCampaign(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCampaign(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
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
        <CampaignActions permissions={permissions} />
      </HeaderTableWrapper>
      <CampaignTable
        isLoading={isLoading}
        columns={campaignColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <CampaignOptions
          search={search}
          setSearch={setSearch}
          areaId={areaId}
          setAreaId={setAreaId}
          discountType={discountType}
          setDiscountType={setDiscountType}
          status={status}
          setStatus={setStatus}
        />
      </CampaignTable>

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
