"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Target, Award, Calendar } from "lucide-react";
import { useAllPeriods } from "../../evaluaciondesempeño/periodos/lib/period.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  useAllCycles,
  useCycleDetails,
} from "../../evaluaciondesempeño/ciclos/lib/cycle.hook";
import { useAllEvaluations } from "../../evaluaciondesempeño/evaluaciones/lib/evaluation.hook";
import { useEvaluationPersonByPersonAndEvaluation } from "../../evaluaciondesempeño/evaluation-person/lib/evaluationPerson.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import EmptyState from "../../evaluaciondesempeño/evaluation-person/components/EmptyState";

export interface SelectedItem {
  id: number;
  title: string;
  type: "objective" | "competence";
}

interface ObjectivesCompetencesSheetProps {
  open: boolean;
  onClose: () => void;
  personId: number;
  onSave: (items: SelectedItem[]) => void;
}

interface FormValues {
  period_id: string;
  cycle_id: string;
}

export default function ObjectivesCompetencesSheet({
  open,
  onClose,
  personId,
  onSave,
}: ObjectivesCompetencesSheetProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const form = useForm<FormValues>({
    defaultValues: {
      period_id: "",
      cycle_id: "",
    },
  });

  const selectedPeriodId = form.watch("period_id");
  const selectedCycleId = form.watch("cycle_id");

  const { data: periods = [], isLoading: isLoadingPeriods } = useAllPeriods();
  const { data: allCycles = [], isLoading: isLoadingCycles } = useAllCycles();
  const { data: allEvaluations = [], isLoading: isLoadingEvaluations } =
    useAllEvaluations();

  // Filtrar ciclos según el periodo seleccionado
  const filteredCycles = useMemo(() => {
    if (!selectedPeriodId) return [];
    return allCycles.filter(
      (cycle) => cycle.period_id.toString() === selectedPeriodId
    );
  }, [allCycles, selectedPeriodId]);

  // Buscar la evaluación asociada al ciclo seleccionado (relación 1 a 1)
  const selectedEvaluation = useMemo(() => {
    if (!selectedCycleId) return null;
    return allEvaluations.find(
      (evaluation) => evaluation.cycle_id.toString() === selectedCycleId
    );
  }, [allEvaluations, selectedCycleId]);

  // Obtener detalles del ciclo con filtro por persona
  const { data: cycleDetails, isLoading: isLoadingDetails } = useCycleDetails(
    selectedCycleId ? parseInt(selectedCycleId) : 0,
    selectedCycleId ? { person_id: personId } : undefined
  );

  // Filtrar objetivos de la persona
  const objectives = useMemo(() => {
    if (!cycleDetails?.data) return [];
    return cycleDetails.data.filter((detail) => detail.objective);
  }, [cycleDetails]);

  // Obtener competencias de la persona por evaluación (si existe una evaluación asociada al ciclo)
  const { data: evaluationPersonData, isLoading: isLoadingCompetences } =
    useEvaluationPersonByPersonAndEvaluation(personId, selectedEvaluation?.id);

  // Extraer competencias distintas (DISTINCT por competence_id, tomando el primer ID del registro)
  const competences = useMemo(() => {
    if (!evaluationPersonData?.competenceGroups) return [];

    // Crear un Map para obtener solo la primera ocurrencia de cada competence_id
    const uniqueCompetences = new Map();

    evaluationPersonData.competenceGroups.forEach((group) => {
      if (!uniqueCompetences.has(group.competence_id)) {
        // Tomamos el primer ID del registro (evaluator) de gh_evaluation_person_competence_detail
        const firstId =
          group.sub_competences?.[0]?.evaluators?.[0]?.id ||
          group.competence_id;

        uniqueCompetences.set(group.competence_id, {
          id: firstId,
          competence_id: group.competence_id,
          competence: group.competence_name,
        });
      }
    });

    return Array.from(uniqueCompetences.values());
  }, [evaluationPersonData]);

  const handleToggleItem = (
    id: number,
    title: string,
    type: "objective" | "competence"
  ) => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.id === id && item.type === type);
      if (exists) {
        return prev.filter((item) => !(item.id === id && item.type === type));
      } else {
        return [...prev, { id, title, type }];
      }
    });
  };

  const isItemSelected = (id: number, type: "objective" | "competence") => {
    return selectedItems.some((item) => item.id === id && item.type === type);
  };

  const handleSave = () => {
    onSave(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems([]);
    onClose();
  };

  if (isLoadingPeriods || isLoadingCycles || isLoadingEvaluations) {
    return (
      <GeneralSheet
        open={open}
        onClose={onClose}
        title="Mis Objetivos y/o Competencias"
        icon="Target"
        className="max-w-4xl!"
      >
        <FormSkeleton />
      </GeneralSheet>
    );
  }

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Mis Objetivos y/o Competencias"
      subtitle="Selecciona los objetivos y competencias asociados al plan"
      icon="Target"
      className="max-w-4xl!"
    >
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
        <Form {...form}>
          <GroupFormSection
            title="Filtros"
            icon={Calendar}
            cols={{ sm: 1, md: 2, lg: 2 }}
          >
            <FormSelect
              name="period_id"
              label="Periodo"
              placeholder="Selecciona un periodo"
              options={periods.map((period) => ({
                label: period.name,
                value: period.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />

            <FormSelect
              name="cycle_id"
              label="Ciclo"
              placeholder="Selecciona un ciclo"
              options={filteredCycles.map((cycle) => ({
                label: cycle.name,
                value: cycle.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={!selectedPeriodId}
            />
          </GroupFormSection>

          {/* Sección de Objetivos */}
          <GroupFormSection
            title="Objetivos"
            icon={Target}
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="col-span-full">
              {!selectedCycleId ? (
                <EmptyState
                  title="Selecciona un ciclo"
                  description="Selecciona un periodo y ciclo para ver los objetivos"
                  icon={Target}
                />
              ) : isLoadingDetails ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Cargando objetivos...</p>
                </div>
              ) : objectives.length === 0 ? (
                <EmptyState
                  title="No se encontraron objetivos"
                  description="No hay objetivos asignados para este ciclo"
                  icon={Target}
                />
              ) : (
                <div className="space-y-2">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        handleToggleItem(
                          objective.id,
                          objective.objective,
                          "objective"
                        )
                      }
                    >
                      <Checkbox
                        checked={isItemSelected(objective.id, "objective")}
                        onCheckedChange={() =>
                          handleToggleItem(
                            objective.id,
                            objective.objective,
                            "objective"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {objective.objective}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GroupFormSection>

          {/* Sección de Competencias */}
          <GroupFormSection
            title="Competencias"
            icon={Award}
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="col-span-full">
              {!selectedCycleId ? (
                <EmptyState
                  title="Selecciona un ciclo"
                  description="Selecciona un periodo y ciclo para ver las competencias"
                  icon={Award}
                />
              ) : !selectedEvaluation ? (
                <EmptyState
                  title="Sin evaluación asociada"
                  description="Este ciclo no tiene una evaluación asociada"
                  icon={Award}
                />
              ) : isLoadingCompetences ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Cargando competencias...</p>
                </div>
              ) : competences.length === 0 ? (
                <EmptyState
                  title="No se encontraron competencias"
                  description="No hay competencias asignadas para esta evaluación"
                  icon={Award}
                />
              ) : (
                <div className="space-y-2">
                  {competences.map((competence) => (
                    <div
                      key={competence.competence_id}
                      className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        handleToggleItem(
                          competence.competence_id,
                          competence.competence,
                          "competence"
                        )
                      }
                    >
                      <Checkbox
                        checked={isItemSelected(
                          competence.competence_id,
                          "competence"
                        )}
                        onCheckedChange={() =>
                          handleToggleItem(
                            competence.competence_id,
                            competence.competence,
                            "competence"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {competence.competence}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GroupFormSection>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1"
              disabled={selectedItems.length === 0}
            >
              Guardar Selección ({selectedItems.length})
            </Button>
          </div>
        </Form>
      </div>
    </GeneralSheet>
  );
}
