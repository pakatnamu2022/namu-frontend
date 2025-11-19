"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calendar } from "lucide-react";
import DatePicker from "@/shared/components/DatePicker";
import ObjectivesCompetencesSheet from "./ObjectivesCompetencesSheet";

interface Task {
  id: string;
  name: string;
  endDate: Date | undefined;
}

interface DevelopmentPlanFormProps {
  personId: number;
  onSuccess?: () => void;
}

export default function DevelopmentPlanForm({
  personId,
  onSuccess,
}: DevelopmentPlanFormProps) {
  // Estados del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [noAssociate, setNoAssociate] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Estados para agregar nueva tarea
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date | undefined>(
    undefined
  );

  const handleAddTask = () => {
    if (!newTaskName.trim() || !newTaskEndDate) {
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTaskName.trim(),
      endDate: newTaskEndDate,
    };

    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setNewTaskEndDate(undefined);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar el envío del formulario cuando esté lista la API
    console.log({
      title,
      description,
      startDate,
      endDate,
      noAssociate,
      tasks,
      personId,
    });

    // Llamar onSuccess si existe (para cerrar el sheet)
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título del Plan */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título del Plan de Desarrollo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ingresa el título del plan..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={250}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/250
        </p>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe el plan de desarrollo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      {/* Intervalo de Duración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Intervalo de Duración
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Fecha de Inicio"
            placeholder="Selecciona la fecha de inicio"
            value={startDate}
            onChange={setStartDate}
            disabledRange={endDate ? { after: endDate } : undefined}
          />
          <DatePicker
            label="Fecha de Fin"
            placeholder="Selecciona la fecha de fin"
            value={endDate}
            onChange={setEndDate}
            disabledRange={startDate ? { before: startDate } : undefined}
          />
        </CardContent>
      </Card>

      {/* Asociar Objetivos y/o Competencias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">¿Qué trabajará este plan?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="noAssociate"
              checked={noAssociate}
              onCheckedChange={(checked) => setNoAssociate(checked as boolean)}
            />
            <Label
              htmlFor="noAssociate"
              className="text-sm font-normal cursor-pointer"
            >
              No asociar a mis objetivos y/o competencias
            </Label>
          </div>

          {!noAssociate && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Mis Objetivos y/o Competencias
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agregar Tareas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tareas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para agregar nueva tarea */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="text-sm font-medium">Agregar Nueva Tarea</h4>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="taskName">Nombre de la Tarea</Label>
                <Input
                  id="taskName"
                  placeholder="Nombre de la tarea..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2 w-full sm:w-64">
                <Label htmlFor="taskEndDate" className="text-sm font-medium">
                  Fecha Fin
                </Label>
                <DatePicker
                  placeholder="Selecciona la fecha fin"
                  value={newTaskEndDate}
                  onChange={setNewTaskEndDate}
                  className="[&_button]:h-9"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddTask}
                disabled={!newTaskName.trim() || !newTaskEndDate}
                className="h-9 w-full sm:w-auto whitespace-nowrap px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
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
                        Nombre
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
                        <td className="p-3 text-sm">{task.name}</td>
                        <td className="p-3 text-sm">
                          {task.endDate
                            ? new Date(task.endDate).toLocaleDateString("es-ES")
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
        </CardContent>
      </Card>

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
      />
    </form>
  );
}
