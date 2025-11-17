// app/dashboard/[company]/[module]/equipos/page.tsx
"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import ViewTable from "@/features/gp/gestionsistema/vistas/components/ViewTable";
import {
  useAllViews,
  useViews,
} from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import ViewOptions from "@/features/gp/gestionsistema/vistas/components/ViewOptions";
import ViewActions from "@/features/gp/gestionsistema/vistas/components/ViewActions";
import { viewColumns } from "@/features/gp/gestionsistema/vistas/components/ViewColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  deleteView,
  updateView,
} from "@/features/gp/gestionsistema/vistas/lib/view.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { VIEW } from "@/features/gp/gestionsistema/vistas/lib/view.constants";
import NotFound from '@/app/not-found';


const { MODEL } = VIEW;

export default function ViewPage() {
  // const router = useNavigate();
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useViews({
    page,
    per_page,
    search,
    parent_id: parentId,
  });

  const { data: parents = [] } = useAllViews();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteView(deleteId);
      await refetch();
      successToast("Vista eliminada correctamente.");
    } catch (error) {
      errorToast("Error al eliminar la vista.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdateCell = async (id: number, key: string, value: number) => {
    try {
      await updateView(id, { [key]: value });
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "update"));
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("vistas")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ViewActions />
      </HeaderTableWrapper>
      <ViewTable
        isLoading={isLoading}
        columns={viewColumns({
          onDelete: setDeleteId,
          views: parents,
          onUpdateCell: handleUpdateCell,
        })}
        data={data?.data || []}
      >
        <ViewOptions
          search={search}
          setSearch={setSearch}
          parents={parents}
          parentId={parentId}
          setParentId={setParentId}
        />
      </ViewTable>

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
