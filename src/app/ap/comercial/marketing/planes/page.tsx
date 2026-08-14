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
import { PLANS } from "@/features/ap/comercial/marketing/planes/lib/plans.constants";
import { usePlans } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
import { deletePlans } from "@/features/ap/comercial/marketing/planes/lib/plans.actions";
import PlansActions from "@/features/ap/comercial/marketing/planes/components/PlansActions";
import PlansTable from "@/features/ap/comercial/marketing/planes/components/PlansTable";
import { plansColumns } from "@/features/ap/comercial/marketing/planes/components/PlansColumns";
import PlansOptions from "@/features/ap/comercial/marketing/planes/components/PlansOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingPlansPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PLANS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePlans({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePlans(deleteId);
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
        <PlansActions permissions={permissions} />
      </HeaderTableWrapper>
      <PlansTable
        isLoading={isLoading}
        columns={plansColumns({ onDelete: setDeleteId, permissions })}
        data={data?.data || []}
      >
        <PlansOptions search={search} setSearch={setSearch} />
      </PlansTable>

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
