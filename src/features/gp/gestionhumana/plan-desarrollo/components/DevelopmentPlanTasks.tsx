"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ListChecks } from "lucide-react";
import DatePicker from "@/shared/components/DatePicker";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormInput } from "@/shared/components/FormInput";
import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

export interface Task {
  id: string;
  description: string;
  end_date: Date | undefined;
  fulfilled?: boolean;
}

interface DevelopmentPlanTasksProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onRemoveTask: (taskId: string) => void;
}

export default function DevelopmentPlanTasks({
  tasks,
  onAddTask,
  onRemoveTask,
}: DevelopmentPlanTasksProps) {
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

    onAddTask(newTask);
    setNewTaskDescription("");
    setNewTaskEndDate(undefined);
  };

  const taskColumns: ColumnDef<Task>[] = [
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.description}</div>
      ),
    },
    {
      accessorKey: "end_date",
      header: "Fecha Fin",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.end_date
            ? new Date(row.original.end_date).toLocaleDateString("es-ES")
            : "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acción",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onRemoveTask(row.original.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
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
                className="h-9!"
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
            <DataTable
              columns={taskColumns}
              data={tasks}
              variant="outline"
              isVisibleColumnFilter={false}
            />
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
