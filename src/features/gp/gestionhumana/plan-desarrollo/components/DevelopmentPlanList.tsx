"use client";

import { useState } from "react";
import { Target } from "lucide-react";
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
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { DevelopmentPlanCard } from "./DevelopmentPlanCard";

interface DevelopmentPlanListProps {
  personId: number;
}

export default function DevelopmentPlanList({
  personId,
}: DevelopmentPlanListProps) {
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());
  const [expandedObjectivesCompetences, setExpandedObjectivesCompetences] =
    useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  // Obtener usuario autenticado para verificar si es líder
  const user = useAuthStore((state) => state.user);
  const isLeader = user?.subordinates > 0;

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

  const toggleObjectivesCompetences = (planId: number) => {
    const newExpanded = new Set(expandedObjectivesCompetences);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedObjectivesCompetences(newExpanded);
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

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        title="No hay planes de desarrollo registrados"
        description="Crea tu primer plan de desarrollo haciendo clic en 'Crear Plan'"
        icon={Target}
      />
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <DevelopmentPlanCard
          key={plan.id}
          plan={plan}
          isLeader={isLeader}
          isExpanded={expandedPlans.has(plan.id)}
          expandedObjectivesCompetences={expandedObjectivesCompetences.has(
            plan.id
          )}
          newComment={comments[plan.id] || ""}
          onToggleExpand={() => togglePlan(plan.id)}
          onToggleObjectivesCompetences={() =>
            toggleObjectivesCompetences(plan.id)
          }
          onDelete={() => setDeleteId(plan.id)}
          onToggleTask={(taskId) => toggleTaskCompletion(plan.id, taskId)}
          onCommentChange={(value) => handleCommentChange(plan.id, value)}
          onSubmitComment={() => handleSubmitComment(plan.id)}
        />
      ))}

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
