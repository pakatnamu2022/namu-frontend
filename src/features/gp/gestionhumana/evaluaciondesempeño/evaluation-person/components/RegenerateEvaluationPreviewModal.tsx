"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCcw,
  UserPlus,
  UserMinus,
  Users,
  TrendingUp,
} from "lucide-react";
import { getRegenerateEvaluationPreview } from "../lib/evaluationPerson.actions";
import type { RegenerateEvaluationPreviewResponse } from "../lib/evaluationPerson.interface";
import { ScrollArea } from "@/components/ui/scroll-area";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface RegenerateEvaluationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
  params: {
    mode: string;
    reset_progress: boolean;
    force: boolean;
  };
  onConfirm: () => void;
}

export function RegenerateEvaluationPreviewModal({
  open,
  onClose,
  evaluationId,
  params,
  onConfirm,
}: RegenerateEvaluationPreviewModalProps) {
  const [previewData, setPreviewData] =
    useState<RegenerateEvaluationPreviewResponse | null>(null);

  const previewMutation = useMutation({
    mutationFn: () => getRegenerateEvaluationPreview(evaluationId, params),
    onSuccess: (data) => {
      setPreviewData(data);
    },
  });

  useEffect(() => {
    if (open) {
      // Cuando se abre el modal, hacer la petición
      previewMutation.mutate();
    } else {
      // Limpiar datos al cerrar
      setPreviewData(null);
      previewMutation.reset();
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={
          !previewData || !previewData.will_execute || previewMutation.isPending
        }
        className="gap-2"
      >
        <RefreshCcw className="size-4" />
        Confirmar Regeneración
      </Button>
    </div>
  );

  const getImpactColor = (impact: string) => {
    if (impact.includes("ALTO")) return "red";
    if (impact.includes("MEDIO")) return "yellow";
    return "green";
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Vista Previa de Regeneración de Evaluación"
      subtitle="Revisa los cambios que se realizarán antes de regenerar la evaluación completa"
      size="4xl"
      icon="RefreshCcw"
      childrenFooter={footer}
    >
      <div className="space-y-4">
        {previewMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando información...
            </span>
          </div>
        )}

        {previewMutation.isError && (
          <Alert variant="destructive">
            <XCircle className="size-4" />
            <AlertDescription>
              Error al cargar la información. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {previewData && (
          <>
            {/* Información de la evaluación */}
            <Alert>
              <RefreshCcw className="size-4" />
              <AlertDescription>
                <h3 className="font-semibold mb-3">
                  Información de la Evaluación
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">
                      Nombre
                    </span>
                    <p className="font-medium">{previewData.evaluation.name}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">
                      Modo
                    </span>
                    <p className="font-medium capitalize">
                      {previewData.parameters.mode.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">
                      Reiniciar progreso
                    </span>
                    <Badge
                      className="w-fit"
                      variant={
                        previewData.parameters.reset_progress === true ||
                        previewData.parameters.reset_progress === "true"
                          ? "default"
                          : "ghost"
                      }
                    >
                      {previewData.parameters.reset_progress === true ||
                      previewData.parameters.reset_progress === "true"
                        ? "Sí"
                        : "No"}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">
                      Forzar
                    </span>
                    <Badge
                      className="w-fit"
                      variant={
                        previewData.parameters.force === true ||
                        previewData.parameters.force === "true"
                          ? "default"
                          : "ghost"
                      }
                    >
                      {previewData.parameters.force === true ||
                      previewData.parameters.force === "true"
                        ? "Sí"
                        : "No"}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Estado Actual y Análisis del Ciclo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado Actual */}
              <Alert>
                <Users className="size-4" />
                <AlertDescription>
                  <h3 className="font-semibold text-sm mb-3">Estado Actual</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total de personas:
                      </span>
                      <Badge variant="outline">
                        {previewData.current_state.total_persons}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Evaluaciones:
                      </span>
                      <Badge variant="outline">
                        {
                          previewData.current_state.statistics
                            .evaluation_persons
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resultados:</span>
                      <Badge variant="outline">
                        {previewData.current_state.statistics.person_results}
                      </Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Análisis del Ciclo */}
              <Alert>
                <TrendingUp className="size-4" />
                <AlertDescription>
                  <h3 className="font-semibold text-sm mb-3">
                    Análisis del Ciclo
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Personas esperadas:
                      </span>
                      <Badge variant="outline">
                        {previewData.cycle_analysis.expected_persons_in_cycle}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Cambios detectados:
                      </span>
                      <Badge
                        variant={
                          previewData.cycle_analysis.changes_detected
                            ? "default"
                            : "outline"
                        }
                      >
                        {previewData.cycle_analysis.changes_detected
                          ? "Sí"
                          : "No"}
                      </Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Resumen de Cambios */}
            <Alert className="bg-blue-50/50 border-blue-200">
              <CheckCircle2 className="size-4 text-blue-600" />
              <AlertDescription>
                <h3 className="font-semibold mb-3">Resumen de Cambios</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <UserPlus className="size-6 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {previewData.affected_persons.summary.total_will_add || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">A Agregar</p>
                  </div>
                  <div className="text-center">
                    <UserMinus className="size-6 mx-auto mb-1 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">
                      {previewData.affected_persons.summary.total_will_remove ||
                        0}
                    </p>
                    <p className="text-xs text-muted-foreground">A Eliminar</p>
                  </div>
                  {previewData.affected_persons.summary.total_will_keep !==
                    undefined && (
                    <div className="text-center">
                      <Users className="size-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">
                        {previewData.affected_persons.summary.total_will_keep}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Se Mantienen
                      </p>
                    </div>
                  )}
                  {previewData.affected_persons.summary
                    .persons_with_progress_lost !== undefined && (
                    <div className="text-center">
                      <AlertTriangle className="size-6 mx-auto mb-1 text-orange-600" />
                      <p className="text-2xl font-bold text-orange-600">
                        {
                          previewData.affected_persons.summary
                            .persons_with_progress_lost
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Progreso Perdido
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {previewData.affected_persons.description}
                    </span>
                    <Badge
                      color={getImpactColor(
                        previewData.affected_persons.impact,
                      )}
                    >
                      {previewData.affected_persons.impact}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Validaciones */}
            {previewData.validations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Validaciones</h3>
                <div className="space-y-1">
                  {previewData.validations.map((validation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{validation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {(previewData.warnings.length > 0 ||
              previewData.affected_persons.warnings.length > 0) && (
              <Alert variant="warning">
                <AlertTriangle className="size-4 text-yellow-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold">Advertencias</p>
                    {previewData.warnings.map((warning, index) => (
                      <p key={`w-${index}`} className="text-sm">
                        • {warning}
                      </p>
                    ))}
                    {previewData.affected_persons.warnings.map(
                      (warning, index) => (
                        <p key={`aw-${index}`} className="text-sm">
                          • {warning}
                        </p>
                      ),
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {previewData.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold">Errores:</p>
                    {previewData.errors.map((error, index) => (
                      <p key={index} className="text-sm">
                        • {error}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Personas Afectadas */}
            {((previewData.affected_persons.persons_to_add?.length || 0) > 0 ||
              (previewData.affected_persons.persons_to_remove?.length || 0) >
                0) && (
              <div className="space-y-3">
                <h3 className="font-semibold">Personas Afectadas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personas a Agregar */}
                  {(previewData.affected_persons.persons_to_add?.length || 0) >
                    0 && (
                    <div className="rounded-lg border">
                      <div className="bg-green-50 p-3 border-b flex items-center gap-2">
                        <UserPlus className="size-4 text-green-600" />
                        <h4 className="font-semibold text-sm">
                          A Agregar (
                          {previewData.affected_persons.persons_to_add
                            ?.length || 0}
                          )
                        </h4>
                      </div>
                      <ScrollArea className="h-[200px] p-3">
                        <div className="space-y-2">
                          {previewData.affected_persons.persons_to_add?.map(
                            (person) => (
                              <div
                                key={person.person_id}
                                className="text-xs border rounded p-2"
                              >
                                <p className="font-semibold">{person.name}</p>
                                <p className="text-muted-foreground">
                                  DNI: {person.dni}
                                </p>
                                <p className="text-muted-foreground">
                                  {person.position}
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                  {person.reason}
                                </p>
                                {person.will_have && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 text-[10px]"
                                  >
                                    {person.will_have.objectives} objetivos
                                  </Badge>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Personas a Remover */}
                  {(previewData.affected_persons.persons_to_remove?.length ||
                    0) > 0 && (
                    <div className="rounded-lg border">
                      <div className="bg-red-50 p-3 border-b flex items-center gap-2">
                        <UserMinus className="size-4 text-red-600" />
                        <h4 className="font-semibold text-sm">
                          A Remover (
                          {previewData.affected_persons.persons_to_remove
                            ?.length || 0}
                          )
                        </h4>
                      </div>
                      <ScrollArea className="h-[200px] p-3">
                        <div className="space-y-2">
                          {previewData.affected_persons.persons_to_remove?.map(
                            (person) => (
                              <div
                                key={person.person_id}
                                className="text-xs border rounded p-2"
                              >
                                <p className="font-semibold">{person.name}</p>
                                <p className="text-muted-foreground">
                                  DNI: {person.dni}
                                </p>
                                <p className="text-muted-foreground">
                                  {person.position}
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                  {person.reason}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje si no se puede ejecutar */}
            {!previewData.will_execute && (
              <Alert variant="destructive">
                <XCircle className="size-4" />
                <AlertDescription>
                  No se puede ejecutar la regeneración debido a los errores
                  encontrados. Por favor, revisa y corrige los problemas antes
                  de continuar.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
