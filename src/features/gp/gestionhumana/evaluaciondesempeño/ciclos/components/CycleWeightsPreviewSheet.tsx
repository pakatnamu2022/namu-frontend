"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import {
  useCycleWeightsPreview,
  useRegenerateCycleWeights,
} from "../lib/cycle.hook";
import {
  WeightsPreviewPerson,
  WeightsPreviewObjective,
} from "../lib/cycle.interface";
import { toast } from "sonner";

interface CycleWeightsPreviewSheetProps {
  open: boolean;
  onClose: () => void;
  cycleId: number;
}

export default function CycleWeightsPreviewSheet({
  open,
  onClose,
  cycleId,
}: CycleWeightsPreviewSheetProps) {
  const { data, isLoading, isError, refetch } = useCycleWeightsPreview(
    cycleId,
    open,
  );

  const regenerateMutation = useRegenerateCycleWeights();

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync(cycleId);
      toast.success("Pesos regenerados exitosamente");
    } catch (error) {
      toast.error("Error al regenerar los pesos");
    }
  };

  const footer = (
    <div className="flex justify-end items-center gap-2">
      <Button variant="outline" onClick={onClose}>
        Cerrar
      </Button>
      <ConfirmationDialog
        trigger={
          <Button variant="default" disabled={regenerateMutation.isPending}>
            {regenerateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Regenerar pesos
              </>
            )}
          </Button>
        }
        title="¿Regenerar pesos?"
        description="Esta acción recalculará los pesos de los objetivos para todas las personas del ciclo. ¿Deseas continuar?"
        confirmText="Sí, regenerar"
        cancelText="Cancelar"
        onConfirm={handleRegenerate}
        icon="warning"
      />
    </div>
  );

  const renderPersonCard = (person: WeightsPreviewPerson) => (
    <div key={person.person_id} className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-sm">{person.person}</p>
          <p className="text-xs text-muted-foreground">{person.category}</p>
        </div>
        <Badge color={person.total_weight === 100 ? "green" : "red"}>
          {person.total_weight}%
        </Badge>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Objetivos:</p>
        {person.objectives.map((objective: WeightsPreviewObjective) => (
          <div
            key={objective.id}
            className="flex items-center justify-between text-xs bg-muted/50 rounded p-2"
          >
            <div className="flex-1">
              <p className="font-medium">{objective.objective}</p>
              {objective.fixedWeight && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  Peso fijo
                </Badge>
              )}
            </div>
            <span className="font-semibold ml-2">{objective.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Vista Previa de Pesos"
      subtitle="Revisa el estado de los pesos de objetivos por persona"
      size="4xl"
      icon="Scale"
      childrenFooter={footer}
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando información...
            </span>
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <XCircle className="size-4" />
            <AlertDescription>
              Error al cargar la información. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {data && (
          <>
            {/* Alert informativo */}
            {data.needs_update_count > 0 ? (
              <Alert variant="warning">
                <AlertTriangle />
                <AlertTitle>
                  {data.needs_update_count} persona(s) con pesos incorrectos
                </AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      Los pesos de los objetivos deben sumar exactamente 100%
                    </div>
                    <Badge color="orange" size="lg">
                      {data.needs_update_count}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="success">
                <CheckCircle2 />
                <AlertTitle>¡Todos los pesos están correctos!</AlertTitle>
                <AlertDescription>
                  Todos los pesos suman exactamente 100%
                </AlertDescription>
              </Alert>
            )}

            {/* Lista de personas */}
            {data.needs_update.length > 0 && (
              <div className="space-y-3">
                {data.needs_update.map((person) => renderPersonCard(person))}
              </div>
            )}
          </>
        )}
      </div>
    </GeneralSheet>
  );
}
