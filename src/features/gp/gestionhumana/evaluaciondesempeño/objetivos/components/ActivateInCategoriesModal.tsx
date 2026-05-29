"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Loader2,
  PlayCircle,
  Users,
  XCircle,
  ArrowRight,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  getActivateInCategoriesPreview,
  activateObjectiveInCategories,
} from "../lib/objective.actions";
import type {
  ActivateInCategoriesPreviewResponse,
  ActivateInCategoriesPreviewWorker,
} from "../lib/objective.interface";
import { errorToast, successToast } from "@/core/core.function";

interface ActivateInCategoriesModalProps {
  open: boolean;
  onClose: () => void;
  objectiveId: number;
  objectiveName: string;
  onSuccess: () => void;
}

function WeightRow({
  label,
  current,
  projected,
  isTarget,
}: {
  label: string;
  current: number;
  projected: number;
  isTarget: boolean;
}) {
  const changed = current !== projected;
  return (
    <div
      className={`flex items-center justify-between text-xs py-1 px-2 rounded ${isTarget ? "bg-green-50 border border-green-200" : changed ? "bg-amber-50" : ""}`}
    >
      <span
        className={`truncate max-w-[140px] ${isTarget ? "font-semibold text-green-700" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <span className={changed ? "line-through text-muted-foreground" : ""}>
          {current.toFixed(1)}%
        </span>
        {changed && (
          <>
            <ArrowRight className="size-3 text-muted-foreground" />
            <span
              className={
                isTarget ? "text-green-700 font-semibold" : "text-amber-700"
              }
            >
              {projected.toFixed(1)}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function WorkerWeights({
  worker,
  targetObjectiveId,
}: {
  worker: ActivateInCategoriesPreviewWorker;
  targetObjectiveId: number;
}) {
  const changedIds = new Set(
    worker.projected_weights
      .filter((pw) => {
        const cw = worker.current_weights.find(
          (c) => c.objective_id === pw.objective_id,
        );
        return cw && (cw.weight !== pw.weight || cw.active !== pw.active);
      })
      .map((pw) => pw.objective_id),
  );
  changedIds.add(targetObjectiveId);

  const relevantWeights = worker.projected_weights.filter((pw) =>
    changedIds.has(pw.objective_id),
  );

  return (
    <div className="space-y-1 mt-2">
      {relevantWeights.map((pw) => {
        const cw = worker.current_weights.find(
          (c) => c.objective_id === pw.objective_id,
        );
        return (
          <WeightRow
            key={pw.objective_id}
            label={
              pw.objective_id === targetObjectiveId
                ? "Este objetivo"
                : `Obj. #${pw.objective_id}`
            }
            current={cw?.weight ?? 0}
            projected={pw.weight}
            isTarget={pw.objective_id === targetObjectiveId}
          />
        );
      })}
    </div>
  );
}

export function ActivateInCategoriesModal({
  open,
  onClose,
  objectiveId,
  objectiveName,
  onSuccess,
}: ActivateInCategoriesModalProps) {
  const [previewData, setPreviewData] =
    useState<ActivateInCategoriesPreviewResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const previewMutation = useMutation({
    mutationFn: () => getActivateInCategoriesPreview(objectiveId),
    onSuccess: (data) => {
      if (!data?.categories) return;
      setPreviewData(data);
      setSelectedIds(new Set(data.categories.map((c) => c.category_id)));
      setExpandedIds(new Set());
    },
  });

  const activateMutation = useMutation({
    mutationFn: () =>
      activateObjectiveInCategories(objectiveId, Array.from(selectedIds)),
    onSuccess: (data) => {
      successToast(
        `Objetivo activado en ${data.affected_categories} categorías (${data.affected_workers} trabajadores).`,
      );
      onSuccess();
      onClose();
    },
    onError: () => {
      errorToast("Error al activar el objetivo en las categorías.");
    },
  });

  useEffect(() => {
    if (open) {
      previewMutation.mutate();
    } else {
      setPreviewData(null);
      setSelectedIds(new Set());
      setExpandedIds(new Set());
      previewMutation.reset();
    }
  }, [open]);

  const allSelected =
    previewData !== null &&
    previewData.categories.length > 0 &&
    previewData.categories.every((c) => selectedIds.has(c.category_id));

  const toggleAll = () => {
    if (!previewData) return;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(previewData.categories.map((c) => c.category_id)));
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const affectedWorkers = previewData
    ? previewData.categories
        .filter((c) => selectedIds.has(c.category_id))
        .reduce((acc, c) => acc + c.affected_workers_count, 0)
    : 0;

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={activateMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        onClick={() => activateMutation.mutate()}
        disabled={
          !previewData ||
          previewData.affected_categories_count === 0 ||
          selectedIds.size === 0 ||
          previewMutation.isPending ||
          activateMutation.isPending
        }
        className="gap-2"
      >
        {activateMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <PlayCircle className="size-4" />
        )}
        Confirmar activación
        {selectedIds.size > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {selectedIds.size}
          </Badge>
        )}
      </Button>
    </div>
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Activar objetivo en categorías"
      subtitle={`Vista previa del efecto dominó para "${objectiveName}"`}
      size="4xl"
      icon="PlayCircle"
      childrenFooter={footer}
    >
      <div className="space-y-4">
        {previewMutation.isPending && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando vista previa...
            </span>
          </div>
        )}

        {previewMutation.isError && (
          <Alert variant="destructive">
            <XCircle className="size-4" />
            <AlertDescription>
              Error al cargar la vista previa. Intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {previewData && (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3">
              <Alert>
                <FolderOpen className="size-4" />
                <AlertDescription>
                  <p className="text-xs text-muted-foreground uppercase">
                    Categorías seleccionadas
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedIds.size}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {previewData.affected_categories_count}
                    </span>
                  </p>
                </AlertDescription>
              </Alert>
              <Alert>
                <Users className="size-4" />
                <AlertDescription>
                  <p className="text-xs text-muted-foreground uppercase">
                    Trabajadores afectados
                  </p>
                  <p className="text-2xl font-bold">{affectedWorkers}</p>
                </AlertDescription>
              </Alert>
            </div>

            {previewData.affected_categories_count === 0 ? (
              <Alert>
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <AlertDescription>
                  Este objetivo ya está activo en todas las categorías
                  relacionadas o no tiene categorías asignadas.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Seleccionar todo */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Selecciona las categorías donde aplicar la activación
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={toggleAll}
                  >
                    {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                  </Button>
                </div>

                {/* Categorías */}
                <ScrollArea className="max-h-[420px] pr-1">
                  <div className="space-y-2">
                    {previewData.categories.map((category) => {
                      const isSelected = selectedIds.has(category.category_id);
                      const isExpanded = expandedIds.has(category.category_id);

                      return (
                        <div
                          key={category.category_id}
                          className={`rounded-lg border transition-colors ${isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}
                        >
                          {/* Header de categoría */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleCategory(category.category_id)
                              }
                            />
                            <FolderOpen className="size-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold text-sm flex-1">
                              {category.category_name}
                            </span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              <Users className="size-3 mr-1" />
                              {category.affected_workers_count} trabajador
                              {category.affected_workers_count !== 1 ? "es" : ""}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0"
                              onClick={() => toggleExpand(category.category_id)}
                              tooltip={
                                isExpanded
                                  ? "Ocultar detalle"
                                  : "Ver pesos por trabajador"
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </div>

                          {/* Detalle expandible */}
                          {isExpanded && (
                            <div className="border-t px-4 pb-3 pt-2 space-y-3">
                              {category.workers.map((worker) => (
                                <div
                                  key={worker.worker_id}
                                  className="rounded border bg-background p-3 space-y-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <Users className="size-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium">
                                      {worker.worker_name}
                                    </span>
                                  </div>
                                  <WorkerWeights
                                    worker={worker}
                                    targetObjectiveId={previewData.objective.id}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
