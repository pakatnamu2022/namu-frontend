"use client";

import { useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import {
  assignCategoriesToCycle,
  deleteCyclePersonDetail,
  updateGoalCyclePersonDetail,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.actions";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import CyclePersonDetailTable from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CyclePersonDetailTable";
import { CyclePersonDetailColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CyclePersonDetailColumns";
import CyclePersonDetailActions from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CyclePersonDetailActions";
import CycleCategoryDetailForm, {
  CycleCategoryDetailFormType,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CycleCategoryDetail";
import { useAllCategoriesWithBosses } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.hook";
import {
  useCategoriesInCycle,
  useChiefsInCycle,
  useCycle,
  useCycleDetails,
  usePersonsInCycle,
  usePositionsInCycle,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/lib/cycle.hook";
import CyclePersonDetailOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/ciclos/components/CyclePersonDetailOptions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

export default function CyclePersonDetailPage() {
  const { id } = useParams();
  // const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [personId, setPersonId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [chiefDni, setChiefDni] = useState<string | null>(null);
  const [objectiveId, setObjectiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openAssign, setOpenAssign] = useState(false);

  const idCycle = Number(id);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data: cycle } = useCycle(idCycle);

  const { data, isLoading, refetch } = useCycleDetails(idCycle, {
    page,
    search,
    person_id: personId,
    position_id: positionId,
    category_id: categoryId,
    chief_id: chiefDni,
    objective_id: objectiveId,
    per_page,
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useAllCategoriesWithBosses(idCycle);

  const { isLoading: isLoadingPersons, refetch: refetchPersons } =
    usePersonsInCycle(idCycle);

  const {
    data: positions = [],
    isLoading: isLoadingPositions,
    refetch: refetchPositions,
  } = usePositionsInCycle(idCycle);

  const {
    data: categoriesCycle = [],
    isLoading: isLoadingCategoriesCycle,
    refetch: refetchCategoriesCycle,
  } = useCategoriesInCycle(idCycle);

  const { data: chiefs = [], isLoading: isLoadingChiefs } =
    useChiefsInCycle(idCycle);

  const handleAssign = async (data: CycleCategoryDetailFormType) => {
    if (!id) return;
    try {
      await assignCategoriesToCycle(idCycle, data);
      await refetch();
      await refetchCategories();
      await refetchPersons();
      await refetchPositions();
      await refetchCategoriesCycle();
      successToast("Participantes asignados correctamente.");
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? "Error al asignar los participantes.",
      );
    } finally {
      setOpenAssign(false);
    }
  };

  const handleUpdateGoalCell = async (id: number, goal: number) => {
    try {
      await updateGoalCyclePersonDetail(id, { goal });
      await refetch();
      successToast("Meta actualizada correctamente.");
    } catch (error) {
      errorToast("Error al actualizar la meta.");
    }
  };

  const handleUpdateWeightCell = async (id: number, weight: number) => {
    try {
      await updateGoalCyclePersonDetail(id, { weight });
      await refetch();
      successToast("Peso actualizado correctamente.");
    } catch (error) {
      errorToast("Error al actualizar el peso.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCyclePersonDetail(deleteId);
      await refetch();
      successToast("Detalle de Ciclo eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el objetivo.");
    } finally {
      setDeleteId(null);
    }
  };

  if (
    isLoadingModule ||
    isLoadingPersons ||
    isLoadingCategories ||
    isLoadingPositions ||
    isLoadingCategoriesCycle ||
    isLoadingChiefs
  )
    return <PageSkeleton />;
  if (!checkRouteExists("ciclos")) notFound();
  if (!currentView) notFound();
  if (!idCycle) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={cycle?.typeEvaluationName}
          icon={currentView.icon}
        />

        <CyclePersonDetailActions
          id={idCycle}
          onAssign={() => setOpenAssign(true)}
        />
      </HeaderTableWrapper>
      <CyclePersonDetailTable
        isLoading={isLoading}
        columns={CyclePersonDetailColumns({
          onDelete: setDeleteId,
          onUpdateGoal: handleUpdateGoalCell,
          onUpdateWeight: handleUpdateWeightCell,
        })}
        data={data?.data || []}
      >
        <CyclePersonDetailOptions
          idCycle={idCycle}
          search={search}
          setSearch={setSearch}
          personId={personId}
          setPersonId={setPersonId}
          positions={positions}
          positionId={positionId}
          setPositionId={setPositionId}
          categories={categoriesCycle}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          chiefs={chiefs}
          chiefDni={chiefDni}
          setChiefDni={setChiefDni}
          objectiveId={objectiveId}
          setObjectiveId={setObjectiveId}
        />
      </CyclePersonDetailTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {openAssign && categories && (
        <CycleCategoryDetailForm
          id={idCycle}
          categories={categories}
          onSubmit={handleAssign}
          open={openAssign}
          onOpenChange={(open) => !open && setOpenAssign(false)}
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
