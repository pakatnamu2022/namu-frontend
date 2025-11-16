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
import { DEFAULT_PER_PAGE, TIPO_LEADS } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { STORE_VISITS } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.constants";
import { useStoreVisits } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.hook";
import { deleteStoreVisits } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.actions";
import StoreVisitsActions from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsActions";
import StoreVisitsTable from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsTable";
import { storeVisitsColumns } from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsColumns";
import StoreVisitsOptions from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function StoreVisitsPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = STORE_VISITS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : undefined;
  };

  const { data, isLoading, refetch } = useStoreVisits({
    page,
    search,
    per_page,
    created_at:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    type: TIPO_LEADS.VISITA,
    sort: "created_at",
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStoreVisits(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <StoreVisitsActions
          dateFrom={dateFrom}
          dateTo={dateTo}
          permissions={permissions}
        />
      </HeaderTableWrapper>
      <StoreVisitsTable
        isLoading={isLoading}
        columns={storeVisitsColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
        onDelete={setDeleteId}
      >
        <StoreVisitsOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </StoreVisitsTable>

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
