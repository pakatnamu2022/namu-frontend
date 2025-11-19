"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Trash2,
  Send,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useDevelopmentPlans } from "../lib/developmentPlan.hook";
import {
  updateDevelopmentPlan,
  deleteDevelopmentPlan,
} from "../lib/developmentPlan.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEVELOPMENT_PLAN } from "../lib/developmentPlan.constants";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import type { DevelopmentPlanResource } from "../lib/developmentPlan.interface";

interface DevelopmentPlanListProps {
  personId: number;
}

export default function DevelopmentPlanList({
  personId,
}: DevelopmentPlanListProps) {
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  const { data, isLoading, refetch } = useDevelopmentPlans({
    worker_id: personId,
  });

  const plans = data?.data || [];

  const togglePlan = (planId: number) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const toggleTaskCompletion = async (planId: number, taskId: number) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedTasks = plan.tasks.map((task) =>
      task.id === taskId ? { ...task, fulfilled: !task.fulfilled } : task
    );

    try {
      await updateDevelopmentPlan(planId, {
        tasks: updatedTasks.map((t) => ({
          description: t.description,
          end_date: t.end_date,
          fulfilled: t.fulfilled,
        })),
      });
      await refetch();
      successToast(SUCCESS_MESSAGE(DEVELOPMENT_PLAN.MODEL, "update"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(DEVELOPMENT_PLAN.MODEL, "update", msg));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDevelopmentPlan(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(DEVELOPMENT_PLAN.MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(DEVELOPMENT_PLAN.MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleCommentChange = (planId: number, value: string) => {
    setComments((prev) => ({
      ...prev,
      [planId]: value,
    }));
  };

  const handleSubmitComment = async (planId: number) => {
    const comment = comments[planId];
    if (!comment?.trim()) {
      errorToast("Por favor ingresa un comentario");
      return;
    }

    try {
      await updateDevelopmentPlan(planId, {
        comment: comment.trim(),
      });
      await refetch();
      setComments((prev) => {
        const newComments = { ...prev };
        delete newComments[planId];
        return newComments;
      });
      successToast("Comentario enviado correctamente");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(DEVELOPMENT_PLAN.MODEL, "update", msg));
    }
  };

  const calculateProgress = (tasks: DevelopmentPlanResource["tasks"]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.fulfilled).length;
    return (completedTasks / tasks.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              No hay planes de desarrollo registrados
            </p>
            <p className="text-sm mt-2">
              Crea tu primer plan de desarrollo haciendo clic en "Crear Plan"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const progress = calculateProgress(plan.tasks);
        const isExpanded = expandedPlans.has(plan.id);
        const completedTasks = plan.tasks.filter((t) => t.fulfilled).length;

        return (
          <Collapsible
            key={plan.id}
            open={isExpanded}
            onOpenChange={() => togglePlan(plan.id)}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-xl">
                      {plan.title || "Plan de Desarrollo"}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(plan.id);
                    }}
                    title="Eliminar plan"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {(plan.start_date || plan.end_date) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {plan.start_date
                          ? new Date(plan.start_date).toLocaleDateString(
                              "es-ES"
                            )
                          : "Sin fecha"}{" "}
                        -{" "}
                        {plan.end_date
                          ? new Date(plan.end_date).toLocaleDateString("es-ES")
                          : "Sin fecha"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedTasks} de {plan.tasks.length} tareas completadas
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progreso</span>
                    <span className="text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <CollapsibleContent>
                  <div className="pt-4 mt-4 border-t space-y-4">
                    <h4 className="font-semibold text-sm">
                      Tareas ({plan.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {plan.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={task.fulfilled}
                            onCheckedChange={() =>
                              toggleTaskCompletion(plan.id, task.id)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <p
                              className={`text-sm font-medium ${
                                task.fulfilled
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.description}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Fecha fin:{" "}
                              {new Date(task.end_date).toLocaleDateString(
                                "es-ES"
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sección de comentarios */}
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold text-sm">Comentarios</h4>

                      {plan.comment && (
                        <div className="p-3 rounded-lg border bg-muted/20">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {plan.comment}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escribe un comentario sobre este plan..."
                          value={comments[plan.id] || ""}
                          onChange={(e) =>
                            handleCommentChange(plan.id, e.target.value)
                          }
                          className="min-h-20 resize-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitComment(plan.id)}
                            disabled={!comments[plan.id]?.trim()}
                            className="gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Enviar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>

              <CardFooter className="bg-muted/30 justify-end">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver más
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </CardFooter>
            </Card>
          </Collapsible>
        );
      })}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
