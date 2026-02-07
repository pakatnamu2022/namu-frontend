"use client";

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WORK_TYPE } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.constant";
import { useWorkTypeById } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.hook";
import { SegmentManager } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/components/SegmentManager";
import FormWrapper from "@/shared/components/FormWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ManageSegmentsPage() {
  const { id } = useParams();
  const router = useNavigate();
  const { ABSOLUTE_ROUTE } = WORK_TYPE;

  const { data: workType, isLoading: loadingWorkType } = useWorkTypeById(
    Number(id),
  );

  if (loadingWorkType || !workType) {
    return <div className="p-4 text-muted">Cargando tipo de trabajo...</div>;
  }

  if (!workType.shift_type) {
    return (
      <FormWrapper>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              Este tipo de trabajo no tiene un tipo de turno asignado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, edite el tipo de trabajo y asigne un tipo de turno
              (Mañana o Noche) antes de gestionar sus segmentos.
            </p>
            <Button onClick={() => router(ABSOLUTE_ROUTE)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestionar Segmentos
            </h1>
            <p className="text-muted-foreground">
              {workType.name} ({workType.code})
            </p>
          </div>
          <Button variant="outline" onClick={() => router(ABSOLUTE_ROUTE)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Información del Tipo de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Código</p>
              <p className="font-medium">{workType.code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-medium">{workType.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo de Turno</p>
              <p className="font-medium">
                {workType.shift_type === "MORNING" ? "Mañana" : "Noche"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Horas Base</p>
              <p className="font-medium">{workType.base_hours}h</p>
            </div>
          </CardContent>
        </Card>

        {/* Segment Manager */}
        <SegmentManager
          workTypeId={workType.id}
          shiftType={workType.shift_type}
          segments={workType.segments || []}
        />
      </div>
    </FormWrapper>
  );
}
