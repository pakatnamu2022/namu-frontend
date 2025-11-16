"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { useCategoryObjectiveWorkerById } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.hook";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";

import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useMutation } from "@tanstack/react-query";
import {
  deleteHierarchicalCategoryObjective,
  storeHierarchicalCategoryObjective,
  updateHierarchicalCategoryObjective,
} from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.actions";
import { CATEGORY_OBJECTIVE } from "../../categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/animateTabs";
import { HierarchicalCategoryResource } from "../lib/hierarchicalCategory.interface";
import { HIERARCHICAL_CATEGORY } from "../lib/hierarchicalCategory.constants";
import { ModelInterface } from "@/src/core/core.interface";
import { CategoryObjectivesList } from "./CategoryObjectivesList";
import { CategoryObjectivePersonList } from "./CategoryObjectivePersonList";
import { AddObjectiveSelect } from "./AddObjectiveSelect";
import { useHierarchicalCategoryById } from "../lib/hierarchicalCategory.hook";

interface Props {
  queryClient: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  category: HierarchicalCategoryResource;
  objectives: ObjectiveResource[];
}

interface SwitchChangeData {
  active: boolean;
  detailId: number;
}

export function HierarchicalCategoryObjectivesModal({
  queryClient,
  open,
  setOpen,
  category,
  objectives,
}: Props) {
  const { QUERY_KEY } = CATEGORY_OBJECTIVE;
  const { QUERY_KEY: HIERARCHICAL_QUERY_KEY } = HIERARCHICAL_CATEGORY;
  const { id, name } = category;
  const { data: fresh = category, refetch } = useHierarchicalCategoryById(id);
  const categoryObjectives = fresh.objectives ?? [];

  const GOAL: ModelInterface = { name: "Meta", gender: false };
  const WEIGHT: ModelInterface = { name: "Peso", gender: false };
  const OBJECTIVE: ModelInterface = { name: "Objetivo", gender: false };

  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

  const { data = [], isLoading: isLoadingWorkers } =
    useCategoryObjectiveWorkerById(category.id);

  const isDuplicate = (posId: number) => {
    const inItems = data.some((i) =>
      i.objectives.some((o) => o.objective_id === posId)
    );
    return inItems;
  };

  const startAdd = () => {
    setAdding(true);
    setSelectedId(null);
  };

  const cancelAdd = () => {
    setAdding(false);
    setSelectedId(null);
  };

  const invalidateQuery = async () => {
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEY + "Person", id],
    });
  };

  const invalidateQueryObjectives = async () => {
    await refetch();
    await queryClient.invalidateQueries({
      queryKey: [HIERARCHICAL_QUERY_KEY],
    });
  };

  const addObjective = async () => {
    if (!selectedId) return;
    if (isDuplicate(selectedId)) return; // evita duplicados
    storeObjective({
      objective_id: selectedId,
      category_id: category.id,
    });
    setSelectedId(null); // deja listo para elegir otra
  };

  const { mutate: storeObjective, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) =>
      storeHierarchicalCategoryObjective({
        objective_id: data.objective_id,
        category_id: category.id,
      }),
    onSuccess: async () => {
      successToast("Objetivo agregado correctamente");
      await invalidateQueryObjectives();
      await invalidateQuery();
    },
    onError: () => {
      errorToast("No se pudo agregar el objetivo");
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SwitchChangeData) =>
      updateHierarchicalCategoryObjective(data.detailId, {
        active: data.active,
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(OBJECTIVE, "update"));
      await invalidateQuery();
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(OBJECTIVE, "update"));
    },
  });

  const handleUpdateGoalCell = async (id: number, goal: number) => {
    try {
      await updateHierarchicalCategoryObjective(id, { goal });
      await invalidateQuery();
      successToast(SUCCESS_MESSAGE(GOAL, "update"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(GOAL, "update"));
    }
  };

  const handleUpdateWeightCell = async (id: number, weight: number) => {
    try {
      await updateHierarchicalCategoryObjective(id, { weight });
      await invalidateQuery();
      successToast(SUCCESS_MESSAGE(WEIGHT, "update"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(WEIGHT, "update"));
    }
  };

  const handleDeleteObjective = async () => {
    if (!deleteDetailId) return;
    try {
      await deleteHierarchicalCategoryObjective({
        category_id: category.id,
        objective_id: deleteDetailId,
      });
      successToast(SUCCESS_MESSAGE(OBJECTIVE, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(OBJECTIVE, "delete"));
    } finally {
      await invalidateQueryObjectives();
      await invalidateQuery();
    }
  };

  const handleSwitchChange = (detailId: number, checked: boolean) => {
    const data: SwitchChangeData = {
      active: checked,
      detailId: detailId,
    };
    mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-4xl overflow-auto">
        <SheetHeader>
          <SheetTitle>Detalles de la categoría jerárquica</SheetTitle>
          <SheetDescription>
            <span className="font-semibold">{name}</span>
          </SheetDescription>
        </SheetHeader>
        {isLoadingWorkers ? (
          <FormSkeleton />
        ) : (
          <div className="mt-4 space-y-4 overflow-auto max-h-[80vh] h-full">
            <Tabs
              defaultValue="objectives"
              className="p-2 w-full h-full bg-muted rounded-lg"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="objectives">Objetivos</TabsTrigger>
                <TabsTrigger value="asignations">Asignaciones</TabsTrigger>
              </TabsList>
              <TabsContents className="rounded-sm h-full bg-background w-full overflow-y-auto">
                <TabsContent value="objectives" className="space-y-6 p-6">
                  <div className="w-full flex justify-end mb-2 gap-2">
                    {!adding ? (
                      <Button variant="outline" size="sm" onClick={startAdd}>
                        Agregar Objetivo
                        <Plus className="size-5 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={cancelAdd}>
                        <X className="size-4 mr-2" />
                        Cancelar agregado
                      </Button>
                    )}
                  </div>

                  {/* Selector de objetivo */}
                  <AddObjectiveSelect
                    adding={adding}
                    setSelectedId={setSelectedId}
                    objectives={objectives}
                    selectedId={selectedId}
                    isDuplicate={isDuplicate}
                    isUpdating={isUpdating}
                    addObjective={addObjective}
                  />

                  {/* Lista de objetivos */}
                  <CategoryObjectivesList
                    categoryObjectives={categoryObjectives}
                    setDeleteDetailId={setDeleteDetailId}
                  />
                </TabsContent>
                <TabsContent value="asignations" className="space-y-6 p-6">
                  {/* Lista de objetivos por Trabajador */}
                  <CategoryObjectivePersonList
                    data={data}
                    handleSwitchChange={handleSwitchChange}
                    isPending={isPending}
                    handleUpdateGoalCell={handleUpdateGoalCell}
                    handleUpdateWeightCell={handleUpdateWeightCell}
                  />
                </TabsContent>
              </TabsContents>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <div className="w-full flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </SheetContent>

      {/* Delete Dialog */}
      {deleteDetailId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteDetailId(null)}
          onConfirm={handleDeleteObjective}
        />
      )}
    </Sheet>
  );
}
