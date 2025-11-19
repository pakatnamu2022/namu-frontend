"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import {
  useAllDetailedDevelopmentPlans,
  useStoreDetailedDevelopmentPlan,
  useUpdateDetailedDevelopmentPlan,
  useDeleteDetailedDevelopmentPlan,
} from "../lib/detailedDevelopmentPlan.hook";
import { StoreDetailedDevelopmentPlanRequest } from "../lib/detailedDevelopmentPlan.interface";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { errorToast, successToast } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface DevelopmentPlanSheetProps {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
  workerId: number;
  bossId: number;
}

export default function DevelopmentPlanSheet({
  open,
  onClose,
  evaluationId,
  workerId,
  bossId,
}: DevelopmentPlanSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");

  // Obtener usuario autenticado para verificar si es jefe
  const user = useAuthStore((state) => state.user);
  const isJefe = user?.subordinates > 0;

  // Construir parámetros de consulta - si bossId es 0, no lo incluimos
  const queryParams: Record<string, any> = {
    gh_evaluation_id: evaluationId,
    worker_id: workerId,
  };

  if (bossId !== 0) {
    queryParams.boss_id = bossId;
  }

  const { data: plans = [], isLoading } =
    useAllDetailedDevelopmentPlans(queryParams);

  const storeMutation = useStoreDetailedDevelopmentPlan();
  const updateMutation = useUpdateDetailedDevelopmentPlan();
  const deleteMutation = useDeleteDetailedDevelopmentPlan();

  const resetForm = () => {
    setDescription("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      errorToast("La descripción es requerida");
      return;
    }

    try {
      const payload: StoreDetailedDevelopmentPlanRequest = {
        description: description.trim(),
        worker_id: workerId,
        boss_id: bossId,
        gh_evaluation_id: evaluationId,
      };

      await storeMutation.mutateAsync(payload);
      successToast("Plan de desarrollo creado exitosamente");
      resetForm();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al guardar el plan de desarrollo"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      successToast("Plan de desarrollo eliminado exitosamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al eliminar el plan de desarrollo"
      );
    }
  };

  const isSaving =
    storeMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <GeneralSheet
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Plan de Desarrollo Detallado"
      className="max-w-4xl!"
    >
      <div className="space-y-4">
        {/* Botón para mostrar/ocultar formulario - Solo para jefes */}
        {isJefe && !showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Crear Nuevo Plan
          </Button>
        )}

        {/* Formulario simple - Solo para jefes */}
        {isJefe && showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el plan de desarrollo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/500
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Crear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabla de planes */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Planes Existentes ({plans.length})
          </h3>

          {isLoading ? (
            <FormSkeleton />
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay planes de desarrollo registrados</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">{plan.description}</p>
                        {plan.comment && (
                          <div className="mt-3 p-3 rounded-lg border bg-muted/20">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Comentario:
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {plan.comment}
                            </p>
                          </div>
                        )}
                      </div>
                      {isJefe && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(plan.id)}
                          disabled={isSaving}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </GeneralSheet>
  );
}
