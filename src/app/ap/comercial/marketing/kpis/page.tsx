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
import { KPIS } from "@/features/ap/comercial/marketing/kpis/lib/kpis.constants";
import { useKpis } from "@/features/ap/comercial/marketing/kpis/lib/kpis.hook";
import { deleteKpis } from "@/features/ap/comercial/marketing/kpis/lib/kpis.actions";
import KpisActions from "@/features/ap/comercial/marketing/kpis/components/KpisActions";
import KpisTable from "@/features/ap/comercial/marketing/kpis/components/KpisTable";
import { kpisColumns } from "@/features/ap/comercial/marketing/kpis/components/KpisColumns";
import KpisOptions from "@/features/ap/comercial/marketing/kpis/components/KpisOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingKpisPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = KPIS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useKpis({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteKpis(deleteId);
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
        <KpisActions permissions={permissions} />
      </HeaderTableWrapper>
      <KpisTable
        isLoading={isLoading}
        columns={kpisColumns({ onDelete: setDeleteId, permissions })}
        data={data?.data || []}
      >
        <KpisOptions search={search} setSearch={setSearch} />
      </KpisTable>

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
