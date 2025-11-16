"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import CycleTable from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleTable";
import { useCycles } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.hook";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import CycleOptions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleOptions";
import CycleActions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleActions";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { cycleColumns } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleColumns";
import { deleteCycle } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.actions";
import { errorToast, successToast } from "@/src/core/core.function";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";

export default function CiclosPage() {
  // const router = useRouter();
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
  if (!currentView) notFound();

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
