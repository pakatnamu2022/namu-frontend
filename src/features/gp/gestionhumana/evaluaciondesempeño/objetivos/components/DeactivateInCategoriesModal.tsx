"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Loader2,
  PowerOff,
  Users,
  XCircle,
  ArrowRight,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  getDeactivateInCategoriesPreview,
  deactivateObjectiveInCategories,
} from "../lib/objective.actions";
import type {
  ActivateInCategoriesPreviewResponse,
  ActivateInCategoriesPreviewWorker,
} from "../lib/objective.interface";
import { errorToast, successToast } from "@/core/core.function";

interface DeactivateInCategoriesModalProps {
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
      className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg ${
        isTarget
          ? "bg-amber-100 text-amber-900"
          : changed
            ? "bg-slate-100 text-slate-700"
            : "bg-slate-100"
      }`}
    >
      <span
        className={`truncate max-w-[140px] ${isTarget ? "font-semibold" : "text-slate-500"}`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <span className={changed ? "line-through text-slate-400 text-[11px]" : ""}>
          {current.toFixed(1)}%
        </span>
        {changed && (
          <>
            <ArrowRight
              className={`size-3 ${isTarget ? "text-amber-600" : "text-slate-500"}`}
            />
            <span className={`font-semibold ${isTarget ? "text-amber-700" : "text-slate-600"}`}>
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

export function DeactivateInCategoriesModal({
  open,
  onClose,
  objectiveId,
  objectiveName,
  onSuccess,
}: DeactivateInCategoriesModalProps) {
  const [previewData, setPreviewData] =
    useState<ActivateInCategoriesPreviewResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const previewMutation = useMutation({
    mutationFn: () => getDeactivateInCategoriesPreview(objectiveId),
    onSuccess: (data) => {
      if (!data?.categories) return;
      setPreviewData(data);
      setSelectedIds(new Set(data.categories.map((c) => c.category_id)));
      setExpandedIds(new Set());
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () =>
      deactivateObjectiveInCategories(objectiveId, Array.from(selectedIds)),
    onSuccess: (data) => {
      successToast(
        `Objetivo desactivado en ${data.affected_categories} categorías (${data.affected_workers} trabajadores).`,
      );
      onSuccess();
      onClose();
    },
    onError: () => {
      errorToast("Error al desactivar el objetivo en las categorías.");
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
        disabled={deactivateMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        variant="destructive"
        onClick={() => deactivateMutation.mutate()}
        disabled={
          !previewData ||
          previewData.affected_categories_count === 0 ||
          selectedIds.size === 0 ||
          previewMutation.isPending ||
          deactivateMutation.isPending
        }
        className="gap-2"
      >
        {deactivateMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <PowerOff className="size-4" />
        )}
        Confirmar desactivación
        {selectedIds.size > 0 && (
          <Badge variant="outline" className="ml-1 text-xs border-white/40 text-white">
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
      title="Desactivar objetivo en categorías"
      subtitle={`Vista previa del efecto para "${objectiveName}"`}
      size="4xl"
      icon="PowerOff"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-amber-50 shadow-sm p-4 flex items-center gap-3">
                <div className="rounded-xl bg-amber-500 p-2.5 shadow-sm">
                  <FolderOpen className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide">
                    Categorías
                  </p>
                  <p className="text-2xl font-bold text-amber-900 leading-tight">
                    {selectedIds.size}
                    <span className="text-sm font-normal text-amber-300 ml-1">
                      / {previewData.affected_categories_count}
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-red-50 shadow-sm p-4 flex items-center gap-3">
                <div className="rounded-xl bg-red-500 p-2.5 shadow-sm">
                  <Users className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-500 font-semibold uppercase tracking-wide">
                    Trabajadores
                  </p>
                  <p className="text-2xl font-bold text-red-900 leading-tight">
                    {affectedWorkers}
                  </p>
                </div>
              </div>
            </div>

            {previewData.affected_categories_count === 0 ? (
              <Alert>
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <AlertDescription>
                  Este objetivo ya está desactivado en todas las categorías
                  relacionadas o no tiene categorías asignadas.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Selecciona las categorías donde aplicar la desactivación
                  </span>
                  <button
                    onClick={toggleAll}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      allSelected
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                  </button>
                </div>

                <div className="space-y-2">
                  {previewData.categories.map((category) => {
                    const isSelected = selectedIds.has(category.category_id);
                    const isExpanded = expandedIds.has(category.category_id);

                    return (
                      <div
                        key={category.category_id}
                        className={`rounded-xl transition-all duration-150 ${
                          isSelected
                            ? "bg-amber-50 shadow-md"
                            : "bg-slate-50 shadow-sm hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                          onClick={() => toggleCategory(category.category_id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleCategory(category.category_id)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={
                              isSelected
                                ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                : ""
                            }
                          />
                          <FolderOpen
                            className={`size-4 shrink-0 ${isSelected ? "text-amber-500" : "text-slate-400"}`}
                          />
                          <span
                            className={`font-semibold text-sm flex-1 ${isSelected ? "text-amber-900" : "text-slate-700"}`}
                          >
                            {category.category_name}
                          </span>
                          <Badge
                            variant={isSelected ? "default" : "outline"}
                            className={`text-xs shrink-0 ${isSelected ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                          >
                            <Users className="size-3 mr-1" />
                            {category.affected_workers_count} trabajador
                            {category.affected_workers_count !== 1 ? "es" : ""}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`size-6 shrink-0 ${isSelected ? "hover:bg-amber-100 text-amber-500" : "text-slate-400"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(category.category_id);
                            }}
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

                        {isExpanded && (
                          <div className="px-4 pb-3 pt-1 space-y-3">
                            {category.workers.map((worker) => (
                              <div
                                key={worker.worker_id}
                                className="rounded-xl bg-white shadow-sm p-3 space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="size-3.5 text-amber-400 shrink-0" />
                                  <span className="text-sm font-medium text-slate-700">
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
              </>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
