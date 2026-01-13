"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ObjectivesCompetencesSheet, {
  type SelectedItem,
} from "./ObjectivesCompetencesSheet";
import { storeDevelopmentPlan } from "@/features/gp/gestionhumana/plan-desarrollo/lib/developmentPlan.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEVELOPMENT_PLAN } from "@/features/gp/gestionhumana/plan-desarrollo/lib/developmentPlan.constants";
import { Form } from "@/components/ui/form";
import DevelopmentPlanGeneralInfo from "./DevelopmentPlanGeneralInfo";
import DevelopmentPlanObjectivesCompetences from "./DevelopmentPlanObjectivesCompetences";
import DevelopmentPlanTasks, { type Task } from "./DevelopmentPlanTasks";

interface DevelopmentPlanFormProps {
  personId: number;
  bossId?: number;
  onSuccess?: () => void;
}

export default function DevelopmentPlanForm({
  personId,
  bossId,
  onSuccess,
}: DevelopmentPlanFormProps) {
  const { MODEL } = DEVELOPMENT_PLAN;

  // Form con react-hook-form
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      noAssociate: false,
    },
  });

  // Estados adicionales
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedObjectivesCompetences, setSelectedObjectivesCompetences] =
    useState<SelectedItem[]>([]);

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSaveSelection = (items: SelectedItem[]) => {
    setSelectedObjectivesCompetences(items);
  };

  const handleRemoveItem = (id: number, type: "objective" | "competence") => {
    setSelectedObjectivesCompetences((prev) =>
      prev.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const handleSubmit = async (data: any) => {
    // Formatear las tareas para el backend
    const formattedTasks = tasks.map((task) => ({
      description: task.description,
      end_date: task.end_date
        ? new Date(task.end_date).toISOString().split("T")[0]
        : "",
      fulfilled: task.fulfilled || false,
    }));

    // Formatear objetivos y competencias para el backend
    const objectivesCompetences = selectedObjectivesCompetences.map((item) => ({
      objective_detail_id: item.type === "objective" ? item.id : null,
      competence_detail_id: item.type === "competence" ? item.id : null,
    }));

    // Preparar datos para enviar al backend
    const formData = {
      title: data.title || null,
      description: data.description,
      start_date: data.start_date
        ? new Date(data.start_date).toISOString().split("T")[0]
        : null,
      end_date: data.end_date
        ? new Date(data.end_date).toISOString().split("T")[0]
        : null,
      worker_id: personId,
      boss_id: bossId || null,
      tasks: formattedTasks,
      objectives_competences: objectivesCompetences,
    };

    try {
      await storeDevelopmentPlan(formData);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));

      // Llamar onSuccess si existe (para cerrar el sheet o redirigir)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Grilla para las dos primeras secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información General */}
          <DevelopmentPlanGeneralInfo form={form} />

          {/* Asociar Objetivos y/o Competencias */}
          <DevelopmentPlanObjectivesCompetences
            form={form}
            selectedItems={selectedObjectivesCompetences}
            onOpenSheet={() => setSheetOpen(true)}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {/* Agregar Tareas - Columna completa */}
        <DevelopmentPlanTasks
          tasks={tasks}
          onAddTask={handleAddTask}
          onRemoveTask={handleRemoveTask}
        />

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1">
            Guardar Plan de Desarrollo
          </Button>
        </div>

        {/* Sheet de Objetivos y Competencias */}
        <ObjectivesCompetencesSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          personId={personId}
          onSave={handleSaveSelection}
        />
      </form>
    </Form>
  );
}
