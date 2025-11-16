"use client";

import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import TitleComponent from "@/src/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SEDE } from "@/src/features/gp/maestro-general/sede/lib/sede.constants";
import { useSedes } from "@/src/features/gp/maestro-general/sede/lib/sede.hook";
import {
  deleteSede,
  updateSede,
} from "@/src/features/gp/maestro-general/sede/lib/sede.actions";
import SedeActions from "@/src/features/gp/maestro-general/sede/components/SedeActions";
import SedeTable from "@/src/features/gp/maestro-general/sede/components/SedeTable";
import SedeOptions from "@/src/features/gp/maestro-general/sede/components/SedeOptions";
import { sedeColumns } from "@/src/features/gp/maestro-general/sede/components/SedeColumns";

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
