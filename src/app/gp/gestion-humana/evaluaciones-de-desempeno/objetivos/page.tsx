"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import ObjectiveTable from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveTable";
import { useObjectives } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import ObjectiveOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveOptions";
import ObjectiveActions from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveActions";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { objectiveColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveColumns";
import {
  deleteObjective,
  updateGoalObjective,
  updateWeightObjective,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

export default function ObjectivePage() {
  // const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useObjectives({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteObjective(deleteId);
      await refetch();
      successToast("Objetivo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el objetivo.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdateGoalCell = async (id: number, goalReference: number) => {
    try {
      await updateGoalObjective(id, { goalReference });
      await refetch();
      successToast("Meta actualizada correctamente.");
    } catch (error) {
      errorToast("Error al actualizar la meta.");
    }
  };

  const handleUpdateWeightCell = async (id: number, fixedWeight: number) => {
    try {
      await updateWeightObjective(id, { fixedWeight });
      await refetch();
      successToast("Peso actualizado correctamente.");
    } catch (error) {
      errorToast("Error al actualizar el peso.");
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("objetivos")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Inventario de equipos"}
          icon={currentView.icon}
        />
        <ObjectiveActions />
      </HeaderTableWrapper>
      <ObjectiveTable
        isLoading={isLoading}
        columns={objectiveColumns({
          onDelete: setDeleteId,
          onUpdateGoal: handleUpdateGoalCell,
          onUpdateWeight: handleUpdateWeightCell,
        })}
        data={data?.data || []}
      >
        <ObjectiveOptions search={search} setSearch={setSearch} />
      </ObjectiveTable>

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
