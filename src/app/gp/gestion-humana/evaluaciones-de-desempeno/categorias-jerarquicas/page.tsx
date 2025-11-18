"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useHierarchicalCategorys } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.hook";
import HierarchicalCategoryActions from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryActions";
import HierarchicalCategoryTable from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryTable";
import HierarchicalCategoryOptions from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryOptions";
import { hierarchicalCategoryColumns } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryColumns";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  deleteHierarchicalCategory,
  storeHierarchicalCategoryDetails,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.actions";
import { errorToast, successToast } from "@/core/core.function";
import { useAllPositions } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.hook";
import { HierarchicalCategoryDetailModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryDetailModal";
import { HierarchicalCategoryResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.interface";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { HierarchicalCategoryObjectivesModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryObjectivesModal";
import { useAllObjectives } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.hook";
import { HierarchicalCategoryCompetenceModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryCompetencesModal";
import { useAllCompetences } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from '@/app/not-found';


export default function HierarchicalCategoryPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [excluded_from_evaluation, setExcludedFromEvaluation] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<HierarchicalCategoryResource | null>(null);
  const [selectedForObjective, setSelectedForObjective] =
    useState<HierarchicalCategoryResource | null>(null);
  const [selectedForCompetence, setSelectedForCompetence] =
    useState<HierarchicalCategoryResource | null>(null);
  const [pass, setPass] = useState("all");

  const queryClient = useQueryClient();

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openObjectivesModal, setOpenObjectivesModal] = useState(false);
  const [openCompetencesModal, setOpenCompetencesModal] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, excluded_from_evaluation, pass, per_page]);

  const { data, isLoading, refetch } = useHierarchicalCategorys({
    page,
    per_page,
    search,
    pass,
    excluded_from_evaluation:
      excluded_from_evaluation !== "all" ? excluded_from_evaluation : undefined,
    sort: "excluded_from_evaluation",
    direction: "asc",
  });

  const { data: positions = [] } = useAllPositions();
  const { data: objectives = [] } = useAllObjectives();
  const { data: competences = [] } = useAllCompetences();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHierarchicalCategory(deleteId);
      await refetch();
      successToast("Categoría Jerárquica eliminada correctamente.");
    } catch (error) {
      errorToast("Error al eliminar la categoría jerárquica.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSelectedCategory = (
    category: HierarchicalCategoryResource | null
  ) => {
    if (!category) return;
    setSelectedCategory(category);
    setOpenDetailModal(true); // <- no uses !!category aquí
  };

  const handleSelectedForObjective = (
    category: HierarchicalCategoryResource | null
  ) => {
    if (!category) return;
    setSelectedForObjective(category);
    setOpenObjectivesModal(true);
  };

  const handleSelectedForCompetence = (
    category: HierarchicalCategoryResource | null
  ) => {
    if (!category) return;
    setSelectedForCompetence(category);
    setOpenCompetencesModal(true);
  };

  const handleAddPositions = async (positions: { position_id: number }[]) => {
    if (!selectedCategory) return;

    const existing =
      selectedCategory.children?.map((c) => ({ position_id: c.position_id })) ??
      [];

    // juntar y quitar duplicados
    const merged = [...existing, ...positions].filter(
      (p, i, arr) => arr.findIndex((x) => x.position_id === p.position_id) === i
    );

    try {
      await storeHierarchicalCategoryDetails(selectedCategory.id, {
        positions: merged,
      });
      await refetch();
      successToast("Posiciones agregadas correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al agregar posiciones."
      );
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("categorias-jerarquicas")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <HierarchicalCategoryActions />
      </HeaderTableWrapper>
      <HierarchicalCategoryTable
        isLoading={isLoading}
        columns={hierarchicalCategoryColumns({
          onDelete: setDeleteId,
          onSelected: handleSelectedCategory,
          onSelectedForObjective: handleSelectedForObjective,
          onSelectedForCompetence: handleSelectedForCompetence,
        })}
        data={data?.data || []}
      >
        <HierarchicalCategoryOptions
          search={search}
          setSearch={setSearch}
          excluded_from_evaluation={excluded_from_evaluation}
          setExcludedFromEvaluation={setExcludedFromEvaluation}
          validation={pass}
          setValidation={setPass}
        />
      </HierarchicalCategoryTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {(selectedCategory || openDetailModal) && (
        <HierarchicalCategoryDetailModal
          queryClient={queryClient}
          open={openDetailModal}
          setOpen={(o) => {
            setOpenDetailModal(o);
            if (!o) {
              // espera la animación del Sheet (shadcn ~200ms)
              setTimeout(() => setSelectedCategory(null), 220);
            }
          }}
          name={selectedCategory?.name || ""}
          data={selectedCategory?.children || []}
          positions={positions}
          onAddPositions={handleAddPositions}
        />
      )}

      {selectedForObjective && openObjectivesModal && (
        <HierarchicalCategoryObjectivesModal
          queryClient={queryClient}
          open={openObjectivesModal}
          setOpen={(o) => {
            setOpenObjectivesModal(o);
            if (!o) {
              setTimeout(() => setSelectedForObjective(null), 220);
            }
          }}
          category={selectedForObjective}
          objectives={objectives}
        />
      )}

      {selectedForCompetence && openCompetencesModal && (
        <HierarchicalCategoryCompetenceModal
          queryClient={queryClient}
          open={openCompetencesModal}
          setOpen={(o) => {
            setOpenCompetencesModal(o);
            if (!o) {
              setTimeout(() => setSelectedForCompetence(null), 220);
            }
          }}
          category={selectedForCompetence}
          competences={competences}
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
