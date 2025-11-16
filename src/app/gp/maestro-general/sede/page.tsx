"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SEDE } from "@/features/gp/maestro-general/sede/lib/sede.constants";
import { useSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import {
  deleteSede,
  updateSede,
} from "@/features/gp/maestro-general/sede/lib/sede.actions";
import SedeActions from "@/features/gp/maestro-general/sede/components/SedeActions";
import SedeTable from "@/features/gp/maestro-general/sede/components/SedeTable";
import SedeOptions from "@/features/gp/maestro-general/sede/components/SedeOptions";
import { sedeColumns } from "@/features/gp/maestro-general/sede/components/SedeColumns";
import NotFound from '@/app/not-found';


export default function SedePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { ROUTE, MODEL } = SEDE;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useSedes({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateSede(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSede(deleteId);
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
        <SedeActions />
      </HeaderTableWrapper>
      <SedeTable
        isLoading={isLoading}
        columns={sedeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <SedeOptions search={search} setSearch={setSearch} />
      </SedeTable>

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
