"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import CycleTable from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleTable";
import { useCycles } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import CycleOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleOptions";
import CycleActions from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleActions";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { cycleColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleColumns";
import { deleteCycle } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.actions";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from "@/app/not-found";


export default function CiclosPage() {
  // const router = useNavigate();
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useCycles({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCycle(deleteId);
      await refetch();
      successToast("Ciclo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el objetivo.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("ciclos")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <CycleActions />
      </HeaderTableWrapper>
      <CycleTable
        isLoading={isLoading}
        columns={cycleColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <CycleOptions search={search} setSearch={setSearch} />
      </CycleTable>

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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
