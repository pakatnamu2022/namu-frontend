"use client";

import { Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DevelopmentPlanResource } from "../lib/developmentPlan.interface";

interface DevelopmentPlanTaskListProps {
  tasks: DevelopmentPlanResource["tasks"];
  isLeader: boolean;
  onToggleTask: (taskId: number) => void;
}

export function DevelopmentPlanTaskList({
  tasks,
  isLeader,
  onToggleTask,
}: DevelopmentPlanTaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-3">
        No hay tareas registradas
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
        Tareas ({tasks.length})
      </h4>
      <div className="grid gap-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={task.fulfilled}
              onCheckedChange={() => onToggleTask(task.id)}
              disabled={!isLeader}
              className="h-4 w-4"
            />
            <p
              className={`text-sm font-medium leading-snug ${
                task.fulfilled ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.end_date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
