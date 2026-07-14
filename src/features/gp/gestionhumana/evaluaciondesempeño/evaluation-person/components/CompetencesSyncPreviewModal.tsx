"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  XCircle,
  UserPlus,
  UserMinus,
  RefreshCcw,
  ListChecks,
} from "lucide-react";
import { getCompetencesSyncPreview } from "../../evaluaciones/lib/evaluation.actions";
import type { CompetencesSyncPreviewResponse } from "../../evaluaciones/lib/evaluationPersonCompetenceDetail.interface";
import { EVALUATOR_TYPES } from "../../evaluaciones/lib/evaluation.constans";
import { ScrollArea } from "@/components/ui/scroll-area";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  open: boolean;
  onClose: () => void;
  evaluationId: number;
  onConfirm: () => void;
}

const evaluatorTypeLabel = (type: number): ReactNode => {
  const label = EVALUATOR_TYPES.find(
    (item) => item.value === String(type),
  )?.label;
  if (label === undefined) return `Tipo ${type}`;
  return typeof label === "function" ? label() : label;
};

export function CompetencesSyncPreviewModal({
  open,
  onClose,
  evaluationId,
  onConfirm,
}: Props) {
  const [previewData, setPreviewData] =
    useState<CompetencesSyncPreviewResponse | null>(null);

  const previewMutation = useMutation({
    mutationFn: () => getCompetencesSyncPreview(evaluationId),
    onSuccess: (data) => setPreviewData(data),
  });

  useEffect(() => {
    if (open) {
      previewMutation.mutate();
    } else {
      setPreviewData(null);
      previewMutation.reset();
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const hasChanges =
    !!previewData &&
    (previewData.total_a_eliminar > 0 || previewData.total_a_agregar > 0);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={!previewData || !hasChanges || previewMutation.isPending}
        className="gap-2"
      >
        <RefreshCcw className="size-4" />
        Confirmar Sincronización
      </Button>
    </div>
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Vista Previa de Sincronización de Competencias"
      subtitle="Revisa los cambios que se realizarán antes de sincronizar las competencias"
      size="4xl"
      icon="ListChecks"
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
            <Alert>
              <ListChecks className="size-4" />
              <AlertDescription>
                <h3 className="font-semibold mb-1">
                  {previewData.evaluation_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasChanges
                    ? "Se detectaron diferencias entre las competencias asignadas y las categorías configuradas."
                    : "No se detectaron cambios pendientes de sincronización."}
                </p>
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-50/50 border-blue-200">
              <RefreshCcw className="size-4 text-blue-600" />
              <AlertDescription>
                <h3 className="font-semibold mb-3">Resumen de Cambios</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <UserPlus className="size-6 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {previewData.total_a_agregar}
                    </p>
                    <p className="text-xs text-muted-foreground">A Agregar</p>
                  </div>
                  <div className="text-center">
                    <UserMinus className="size-6 mx-auto mb-1 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">
                      {previewData.total_a_eliminar}
                    </p>
                    <p className="text-xs text-muted-foreground">A Eliminar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">
                      {previewData.total_sin_respuesta_a_eliminar}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sin Respuesta
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {previewData.total_con_respuesta_a_eliminar}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Con Respuesta
                    </p>
                  </div>
                </div>
                {previewData.total_con_respuesta_a_eliminar > 0 && (
                  <p className="mt-3 pt-3 border-t text-sm text-orange-600">
                    Atención: {previewData.total_con_respuesta_a_eliminar}{" "}
                    registro(s) con respuesta serán eliminados.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            {previewData.personas.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">
                  Personas Afectadas ({previewData.personas.length})
                </h3>
                <ScrollArea className="h-80">
                  <div className="space-y-3 pr-3">
                    {previewData.personas.map((persona) => (
                      <div
                        key={persona.person_id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <p className="font-semibold text-sm">
                          {persona.name}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {persona.a_agregar.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-green-600 mb-1">
                                A Agregar ({persona.a_agregar.length})
                              </p>
                              <div className="space-y-1">
                                {persona.a_agregar.map((item, index) => (
                                  <div
                                    key={index}
                                    className="text-xs border rounded p-1.5"
                                  >
                                    {item.competence} / {item.sub_competence}
                                    <Badge
                                      variant="outline"
                                      className="ml-1 text-[10px]"
                                    >
                                      {evaluatorTypeLabel(item.evaluatorType)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {persona.a_eliminar.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-red-600 mb-1">
                                A Eliminar ({persona.a_eliminar.length})
                              </p>
                              <div className="space-y-1">
                                {persona.a_eliminar.map((item) => (
                                  <div
                                    key={item.id}
                                    className="text-xs border rounded p-1.5"
                                  >
                                    {item.competence} / {item.sub_competence}
                                    <Badge
                                      variant="outline"
                                      className="ml-1 text-[10px]"
                                    >
                                      {evaluatorTypeLabel(item.evaluatorType)}
                                    </Badge>
                                    {item.tiene_respuesta && (
                                      <Badge
                                        color="yellow"
                                        className="ml-1 text-[10px]"
                                      >
                                        Con respuesta
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {!hasChanges && (
              <Alert>
                <AlertDescription>
                  La evaluación ya está sincronizada, no hay cambios que
                  aplicar.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
