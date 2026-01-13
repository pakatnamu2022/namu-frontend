"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Target,
  Award,
  X,
  FileText,
  ListChecks,
} from "lucide-react";
import DatePicker from "@/shared/components/DatePicker";
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
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormInput } from "@/shared/components/FormInput";
import { Label } from "@/components/ui/label";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { Form } from "@/components/ui/form";

interface Task {
  id: string;
  description: string;
  end_date: Date | undefined;
  fulfilled?: boolean;
}

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

  // Estados para agregar nueva tarea
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date | undefined>(
    undefined
  );

  const handleAddTask = () => {
    if (!newTaskDescription.trim() || !newTaskEndDate) {
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      description: newTaskDescription.trim(),
      end_date: newTaskEndDate,
      fulfilled: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskDescription("");
    setNewTaskEndDate(undefined);
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

  const noAssociateValue = form.watch("noAssociate");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Grilla para las dos primeras secciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información General */}
          <GroupFormSection
            title="Información General"
            className="col-span-2"
            icon={FileText}
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="col-span-full">
              <FormInput
                name="title"
                label="Título del Plan de Desarrollo"
                placeholder="Ingresa el título del plan..."
                value={form.watch("title")}
                onChange={(e) => form.setValue("title", e.target.value)}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {form.watch("title").length}/255
              </p>
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe el plan de desarrollo..."
                value={form.watch("description")}
                onChange={(e) => form.setValue("description", e.target.value)}
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.watch("description").length}/500
              </p>
            </div>

            <div className="col-span-full">
              <DateRangePickerFormField
                control={form.control}
                nameFrom="start_date"
                nameTo="end_date"
                label="Rango de Fechas"
                placeholder="Selecciona el rango de fechas"
              />
            </div>
          </GroupFormSection>

          {/* Asociar Objetivos y/o Competencias */}
          <GroupFormSection
            title="¿Qué trabajará este plan?"
            icon={Target}
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="space-y-4">
              <FormSwitch
                control={form.control}
                name="noAssociate"
                text="No asociar a mis objetivos y/o competencias"
                autoHeight
              />

              {!noAssociateValue && (
                <div className="space-y-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSheetOpen(true)}
                    className="w-full"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Agregar Mis Objetivos y/o Competencias
                  </Button>

                  {/* Lista de items seleccionados */}
                  {selectedObjectivesCompetences.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        Seleccionados ({selectedObjectivesCompetences.length})
                      </h4>

                      {/* Objetivos */}
                      {selectedObjectivesCompetences.some(
                        (item) => item.type === "objective"
                      ) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Target className="w-4 h-4" />
                            Objetivos
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedObjectivesCompetences
                              .filter((item) => item.type === "objective")
                              .map((item) => (
                                <Badge
                                  key={`${item.type}-${item.id}`}
                                  variant="default"
                                  className="pr-1"
                                >
                                  <span className="mr-1">{item.title}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveItem(item.id, item.type)
                                    }
                                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Competencias */}
                      {selectedObjectivesCompetences.some(
                        (item) => item.type === "competence"
                      ) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Award className="w-4 h-4" />
                            Competencias
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedObjectivesCompetences
                              .filter((item) => item.type === "competence")
                              .map((item) => (
                                <Badge
                                  key={`${item.type}-${item.id}`}
                                  variant="default"
                                  className="pr-1"
                                >
                                  <span className="mr-1">{item.title}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveItem(item.id, item.type)
                                    }
                                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

        {/* Agregar Tareas - Columna completa */}
        <GroupFormSection
          title="Tareas"
          icon={ListChecks}
          cols={{ sm: 1, md: 1, lg: 1 }}
        >
          <div className="space-y-4 col-span-full">
            {/* Formulario para agregar nueva tarea */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <FormInput
                    name="taskDescription"
                    label="Descripción"
                    placeholder="Descripción de la tarea..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="h-9"
                    maxLength={500}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <DatePicker
                    label="Fecha Fin"
                    placeholder="Selecciona la fecha fin"
                    value={newTaskEndDate}
                    onChange={setNewTaskEndDate}
                    className="[&_button]:h-9"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddTask}
                  disabled={!newTaskDescription.trim() || !newTaskEndDate}
                  size="sm"
                  className="h-9 w-full sm:w-auto whitespace-nowrap px-4"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Añadir
                </Button>
              </div>
            </div>

            {/* Lista de tareas */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Tareas Agregadas ({tasks.length})
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">
                          Descripción
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Fecha Fin
                        </th>
                        <th className="text-center p-3 text-sm font-medium w-24">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/50">
                          <td className="p-3 text-sm">{task.description}</td>
                          <td className="p-3 text-sm">
                            {task.end_date
                              ? new Date(task.end_date).toLocaleDateString(
                                  "es-ES"
                                )
                              : "-"}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveTask(task.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </GroupFormSection>

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
