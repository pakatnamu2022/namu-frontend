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
  storeObjective,
  updateGoalObjective,
  updateObjective,
  updateWeightObjective,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { ObjectiveModal } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveModal";
import { ObjectiveResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.interface";
import { ObjectiveSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.schema";

export default function ObjectivePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] =
    useState<ObjectiveResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useObjectives({
    page,
    search,
    per_page,
  });

  const handleOpenAdd = () => {
    setEditingObjective(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (objective: ObjectiveResource) => {
    setEditingObjective(objective);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingObjective(null);
  };

  const handleSubmit = async (formData: ObjectiveSchema) => {
    setIsSubmitting(true);
    try {
      if (editingObjective) {
        await updateObjective(editingObjective.id.toString(), formData);
        successToast("Objetivo actualizado correctamente.");
      } else {
        await storeObjective(formData);
        successToast("Objetivo creado correctamente.");
      }
      await refetch();
      handleCloseModal();
    } catch (error) {
      errorToast(
        editingObjective
          ? "Error al actualizar el objetivo."
          : "Error al crear el objetivo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <ObjectiveActions onAdd={handleOpenAdd} />
      </HeaderTableWrapper>
      <ObjectiveTable
        isLoading={isLoading}
        columns={objectiveColumns({
          onDelete: setDeleteId,
          onEdit: handleOpenEdit,
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

      <ObjectiveModal
        open={modalOpen}
        onClose={handleCloseModal}
        defaultValues={
          editingObjective
            ? {
                name: editingObjective.name,
                description: editingObjective.description,
                metric_id: editingObjective.metric_id?.toString(),
                isAscending: editingObjective.isAscending,
              }
            : {}
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={editingObjective ? "update" : "create"}
      />
    </div>
  );
}
