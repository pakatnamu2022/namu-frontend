"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCompetences } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.hook";
import CompetenceActions from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceActions";
import CompetenceTable from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceTable";
import { competenceColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceColumns";
import CompetenceOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteCompetence } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from "@/app/not-found";


export default function CompetenciasPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useCompetences({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCompetence(deleteId);
      await refetch();
      successToast("Competencia eliminada correctamente.");
    } catch (error) {
      errorToast("Error al eliminar la competencia.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("competencias")) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        ></TitleComponent>
        <CompetenceActions />
      </HeaderTableWrapper>

      <CompetenceTable
        isLoading={isLoading}
        columns={competenceColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <CompetenceOptions search={search} setSearch={setSearch} />
      </CompetenceTable>

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
