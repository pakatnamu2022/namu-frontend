"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getRegeneratePreview } from "../lib/evaluationPerson.actions";
import type { RegeneratePreviewResponse } from "../lib/evaluationPerson.interface";

interface RegeneratePreviewDialogProps {
  personId: number;
  evaluationId: number;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function RegeneratePreviewDialog({
  personId,
  evaluationId,
  onConfirm,
  trigger,
}: RegeneratePreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [previewData, setPreviewData] =
    useState<RegeneratePreviewResponse | null>(null);

  const previewMutation = useMutation({
    mutationFn: () => getRegeneratePreview(personId, evaluationId),
    onSuccess: (data) => {
      setPreviewData(data);
    },
  });

  const handleOpen = () => {
    setOpen(true);
    // Cuando se abre el modal, hacer la petición
    previewMutation.mutate();
  };

  const handleClose = () => {
    setOpen(false);
    // Limpiar datos al cerrar
    setPreviewData(null);
    previewMutation.reset();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={
          !previewData ||
          !previewData.can_regenerate ||
          previewMutation.isPending
        }
        className="gap-2"
      >
        <RefreshCw className="size-4" />
        Regenerar Evaluación
      </Button>
    </div>
  );

  return (
    <>
      <div onClick={handleOpen}>
        {trigger || (
          <Button variant="outline" size="icon" className="h-7">
            <RefreshCw className="size-5" />
          </Button>
        )}
      </div>

      <GeneralModal
        open={open}
        onClose={handleClose}
        title="Vista Previa de Regeneración"
        subtitle="Revisa los cambios que se realizarán antes de regenerar la evaluación"
        size="4xl"
        icon="RefreshCw"
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
              {/* Información de la persona */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">Información del Evaluado</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="font-medium">{previewData.person.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DNI:</span>
                    <p className="font-medium">{previewData.person.dni}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cargo:</span>
                    <p className="font-medium">{previewData.person.position}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Categoría Jerárquica:
                    </span>
                    <p className="font-medium">
                      {previewData.person.hierarchical_category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Validaciones */}
              {previewData.validations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Validaciones</h3>
                  <div className="space-y-1">
                    {previewData.validations.map((validation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{validation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {previewData.warnings.length > 0 && (
                <Alert variant="default" className="border-yellow-500/50">
                  <AlertTriangle className="size-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Advertencias:</p>
                      {previewData.warnings.map((warning, index) => (
                        <p key={index} className="text-sm">
                          • {warning}
                        </p>
                      ))}
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

              {/* Cambios */}
              <div className="grid grid-cols-2 gap-4">
                {/* Lo que se eliminará */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    Se Eliminará
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Evaluaciones de persona:
                      </span>
                      <Badge variant="outline" className="bg-red-50">
                        {previewData.what_will_be_deleted.evaluation_persons}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Detalles de ciclo:
                      </span>
                      <Badge variant="outline" className="bg-red-50">
                        {previewData.what_will_be_deleted.person_cycle_details}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Competencias:
                      </span>
                      <Badge variant="outline" className="bg-red-50">
                        {previewData.what_will_be_deleted.competences}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Lo que se creará */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Se Creará
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Evaluaciones de persona:
                      </span>
                      <Badge variant="outline" className="bg-green-50">
                        {previewData.what_will_be_created.evaluation_persons}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Detalles de ciclo:
                      </span>
                      <Badge variant="outline" className="bg-green-50">
                        {previewData.what_will_be_created.person_cycle_details}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Detalles de competencia:
                      </span>
                      <Badge variant="outline" className="bg-green-50">
                        {previewData.what_will_be_created.competence_details ||
                          0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje si no se puede regenerar */}
              {!previewData.can_regenerate && (
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertDescription>
                    No se puede regenerar la evaluación debido a los errores
                    encontrados. Por favor, revisa y corrige los problemas
                    antes de continuar.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </GeneralModal>
    </>
  );
}
