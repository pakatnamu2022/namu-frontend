"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Lock } from "lucide-react";
import { WorkerTimeline } from "./WorkerTimeline";

interface WorkerTimelineViewProps {
  selectedDate: Date;
  data: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
  onBack: () => void;
  sedeId?: string;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export function WorkerTimelineView({
  selectedDate,
  data,
  onPlanningClick,
  onBack,
  sedeId,
  onRefresh,
  readOnly = false,
}: WorkerTimelineViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Calendario
            </Button>
            <CardTitle>
              Línea de Tiempo -{" "}
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </CardTitle>
            {readOnly && (
              <Badge>
                <Lock className="h-3 w-3" />
                Solo lectura
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <WorkerTimeline
          selectedDate={selectedDate}
          data={data}
          onPlanningClick={onPlanningClick}
          fullPage={true}
          sedeId={sedeId}
          onRefresh={onRefresh}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}
