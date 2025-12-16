"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import PositionOptions from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/components/PositionOptions";
import PositionTable from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/components/PositionTable";
import PositionActions from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/components/PositionActions";
import { deletePosition } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.actions";
import { usePositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook";
import { POSITION } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { positionColumns } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/components/PositionColumns";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

export default function PositionsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { MODEL, ROUTE } = POSITION;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePositions({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePosition(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        ERROR_MESSAGE(MODEL, "delete"),
        error.response.data?.message?.toString()
      );
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
        <PositionActions />
      </HeaderTableWrapper>
      <PositionTable
        isLoading={isLoading}
        columns={positionColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <PositionOptions search={search} setSearch={setSearch} />
      </PositionTable>

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
