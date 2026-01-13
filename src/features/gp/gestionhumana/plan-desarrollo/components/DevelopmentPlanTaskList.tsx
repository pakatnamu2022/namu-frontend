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
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-2.5 p-2.5 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={task.fulfilled}
              onCheckedChange={() => onToggleTask(task.id)}
              disabled={!isLeader}
              className="mt-0.5 h-4 w-4"
            />
            <div className="flex-1 min-w-0 space-y-0.5">
              <p
                className={`text-xs font-medium leading-tight ${
                  task.fulfilled ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.description}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.end_date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
