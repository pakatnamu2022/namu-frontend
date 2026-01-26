"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useWorkTypes } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.hook";
import WorkTypeActions from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeActions";
import WorkTypeTable from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeTable";
import { workTypeColumns } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeColumns";
import WorkTypeOptions from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/WorkTypeOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteWorkType } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_TYPE } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.constant";

export default function WorkTypePage() {
  const { MODEL, ROUTE } = WORK_TYPE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useWorkTypes({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorkType(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <WorkTypeActions />
      </HeaderTableWrapper>

      <WorkTypeTable
        isLoading={isLoading}
        columns={workTypeColumns({
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <WorkTypeOptions search={search} setSearch={setSearch} />
      </WorkTypeTable>

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
