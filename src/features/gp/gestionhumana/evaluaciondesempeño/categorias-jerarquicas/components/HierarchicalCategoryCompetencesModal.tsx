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
} from "@/core/core.function";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";

import FormSkeleton from "@/shared/components/FormSkeleton";
import { useMutation } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/shared/components/animateTabs";
import { HierarchicalCategoryResource } from "../lib/hierarchicalCategory.interface";
import { HIERARCHICAL_CATEGORY } from "../lib/hierarchicalCategory.constants";
import { ModelInterface } from "@/core/core.interface";
import { useHierarchicalCategoryById } from "../lib/hierarchicalCategory.hook";
import { CompetenceResource } from "../../competencias/lib/competence.interface";
import { useCategoryCompetenceWorkerById } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.hook";
import {
  deleteHierarchicalCategoryCompetence,
  storeHierarchicalCategoryCompetence,
  updateHierarchicalCategoryCompetence,
} from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.actions";
import { AddCompetenceSelect } from "./AddCompetenceSelect";
import { CategoryCompetencesList } from "./CategoryCompetenceList";
import { CategoryCompetencePersonList } from "./CategoryCompetencePersonList";
import { CATEGORY_COMPETENCE } from "../../categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.constants";

interface Props {
  queryClient: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  category: HierarchicalCategoryResource;
  competences: CompetenceResource[];
}

interface SwitchChangeData {
  active: boolean;
  detailId: number;
}

export function HierarchicalCategoryCompetenceModal({
  queryClient,
  open,
  setOpen,
  category,
  competences,
}: Props) {
  const { QUERY_KEY } = CATEGORY_COMPETENCE;
  const { QUERY_KEY: HIERARCHICAL_QUERY_KEY } = HIERARCHICAL_CATEGORY;
  const { id, name } = category;
  const { data: fresh = category, refetch } = useHierarchicalCategoryById(id);
  const categoryCompetences = fresh.competences ?? [];

  const GOAL: ModelInterface = { name: "Meta", gender: false };
  const WEIGHT: ModelInterface = { name: "Peso", gender: false };
  const COMPETENCE: ModelInterface = { name: "Competencia", gender: false };

  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

  const { data = [], isLoading: isLoadingWorkers } =
    useCategoryCompetenceWorkerById(category.id);

  const isDuplicate = (posId: number) => {
    const inItems = data.some((i) =>
      i.competences.some((o) => o.competence_id === posId)
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

  const invalidateQueryCompetences = async () => {
    await refetch();
    await queryClient.invalidateQueries({
      queryKey: [HIERARCHICAL_QUERY_KEY],
    });
  };

  const addCompetence = async () => {
    if (!selectedId) return;
    if (isDuplicate(selectedId)) return; // evita duplicados
    storeCompetence({
      competence_id: selectedId,
      category_id: category.id,
    });
    setSelectedId(null); // deja listo para elegir otra
  };

  const { mutate: storeCompetence, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) =>
      storeHierarchicalCategoryCompetence({
        competence_id: data.competence_id,
        category_id: category.id,
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(COMPETENCE, "create"));
      await invalidateQueryCompetences();
      await invalidateQuery();
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? ERROR_MESSAGE(COMPETENCE, "create")
      );
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SwitchChangeData) =>
      updateHierarchicalCategoryCompetence(data.detailId, {
        active: data.active,
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(COMPETENCE, "update"));
      await invalidateQuery();
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(COMPETENCE, "update"));
    },
  });

  const handleUpdateGoalCell = async (id: number, goal: number) => {
    try {
      await updateHierarchicalCategoryCompetence(id, { goal });
      await invalidateQuery();
      successToast(SUCCESS_MESSAGE(GOAL, "update"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(GOAL, "update"));
    }
  };

  const handleUpdateWeightCell = async (id: number, weight: number) => {
    try {
      await updateHierarchicalCategoryCompetence(id, { weight });
      await invalidateQuery();
      successToast(SUCCESS_MESSAGE(WEIGHT, "update"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(WEIGHT, "update"));
    }
  };

  const handleDeleteCompetence = async () => {
    if (!deleteDetailId) return;
    try {
      await deleteHierarchicalCategoryCompetence({
        category_id: category.id,
        competence_id: deleteDetailId,
      });
      successToast(SUCCESS_MESSAGE(COMPETENCE, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(COMPETENCE, "delete"));
    } finally {
      await invalidateQueryCompetences();
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
              defaultValue="competences"
              className="p-2 w-full h-full bg-muted rounded-lg"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competences">Competencias</TabsTrigger>
                <TabsTrigger value="asignations">Asignaciones</TabsTrigger>
              </TabsList>
              <TabsContents className="rounded-sm h-full bg-background w-full overflow-y-auto">
                <TabsContent value="competences" className="space-y-6 p-6">
                  <div className="w-full flex justify-end mb-2 gap-2">
                    {!adding ? (
                      <Button variant="outline" size="sm" onClick={startAdd}>
                        Agregar Competencia
                        <Plus className="size-5 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={cancelAdd}>
                        <X className="size-4 mr-2" />
                        Cancelar agregado
                      </Button>
                    )}
                  </div>

                  {/* Selector de competencia */}
                  <AddCompetenceSelect
                    adding={adding}
                    setSelectedId={setSelectedId}
                    competences={competences}
                    selectedId={selectedId}
                    isDuplicate={isDuplicate}
                    isUpdating={isUpdating}
                    addCompetence={addCompetence}
                  />

                  {/* Lista de competencias */}
                  <CategoryCompetencesList
                    categoryCompetences={categoryCompetences}
                    setDeleteDetailId={setDeleteDetailId}
                  />
                </TabsContent>
                <TabsContent
                  value="asignations"
                  className="space-y-6 p-6 overflow-auto max-h-[70vh]"
                >
                  {/* Lista de competencias por Trabajador */}
                  <CategoryCompetencePersonList
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
          onConfirm={handleDeleteCompetence}
        />
      )}
    </Sheet>
  );
}
