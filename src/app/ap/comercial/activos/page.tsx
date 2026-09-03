"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { ASSETS } from "@/features/ap/comercial/activos/lib/assets.constants";
import {
  useAssets,
  useDeleteAsset,
  useDispatchAssetMigration,
} from "@/features/ap/comercial/activos/lib/assets.hook";
import AssetsTable from "@/features/ap/comercial/activos/components/AssetsTable";
import { AssetsColumns } from "@/features/ap/comercial/activos/components/AssetsColumns";
import AssetsActions from "@/features/ap/comercial/activos/components/AssetsActions";
import AssetsOptions from "@/features/ap/comercial/activos/components/AssetsOptions";

export default function AssetsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { ROUTE } = ASSETS;
  const permissions = useModulePermissions(ROUTE);

  const { data, isLoading, refetch, isFetching } = useAssets({
    page,
    per_page,
    search,
    migration_status: migrationStatus || undefined,
  });

  const deleteMutation = useDeleteAsset();
  const dispatchMigrationMutation = useDispatchAssetMigration();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSettled: () => {
        refetch();
        setDeleteId(null);
      },
    });
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
        <AssetsActions
          isFetching={isFetching && !isLoading}
          onRefresh={refetch}
          permissions={permissions}
        />
      </HeaderTableWrapper>

      <AssetsTable
        isLoading={isLoading}
        columns={AssetsColumns({
          onDelete: setDeleteId,
          onDispatchMigration: (id) => dispatchMigrationMutation.mutate(id),
          permissions,
        })}
        data={data?.data || []}
      >
        <AssetsOptions
          search={search}
          setSearch={setSearch}
          migrationStatus={migrationStatus}
          setMigrationStatus={setMigrationStatus}
        />
      </AssetsTable>

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
