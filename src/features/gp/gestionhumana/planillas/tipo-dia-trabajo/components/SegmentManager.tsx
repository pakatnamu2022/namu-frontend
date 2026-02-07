"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { WorkTypeSegmentSchema } from "../lib/work-type.schema";
import { ShiftType, WorkTypeSegmentResource } from "../lib/work-type.interface";
import { SegmentDialog } from "./SegmentDialog";
import {
  storeWorkTypeSegment,
  updateWorkTypeSegment,
  deleteWorkTypeSegment,
} from "../lib/work-type.actions";
import { successToast, errorToast } from "@/core/core.function";
import { WORK_TYPE } from "../lib/work-type.constant";

interface SegmentManagerProps {
  workTypeId: number;
  shiftType: ShiftType;
  segments: WorkTypeSegmentResource[];
}

export const SegmentManager = ({
  workTypeId,
  shiftType,
  segments: initialSegments,
}: SegmentManagerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] =
    useState<WorkTypeSegmentSchema | null>(null);
  const queryClient = useQueryClient();
  const { QUERY_KEY } = WORK_TYPE;

  const shiftStart = shiftType === "MORNING" ? 7 : 19;

  // Convert API segments to UI format
  const segments: WorkTypeSegmentSchema[] = initialSegments.map((segment) => {
    let startHour = shiftStart;
    for (let i = 0; i < segment.segment_order - 1; i++) {
      const prevSegment = initialSegments.find(
        (s) => s.segment_order === i + 1,
      );
      if (prevSegment) {
        startHour += prevSegment.duration_hours;
      }
    }
    const endHour = startHour + segment.duration_hours;

    return {
      id: segment.id,
      segment_type: segment.segment_type,
      segment_order: segment.segment_order,
      start_hour: startHour,
      end_hour: endHour,
      duration_hours: segment.duration_hours,
      multiplier: segment.multiplier,
      description: segment.description || "",
    };
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (segment: WorkTypeSegmentSchema) => {
      const payload = {
        work_type_id: workTypeId,
        segment_type: segment.segment_type,
        segment_order: segments.length + 1,
        duration_hours: segment.duration_hours,
        multiplier: segment.multiplier,
        description: segment.description || "",
      };
      return storeWorkTypeSegment(payload);
    },
    onSuccess: () => {
      successToast("Segmento creado exitosamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, workTypeId] });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message ?? "Error al crear segmento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WorkTypeSegmentSchema;
    }) => {
      const payload = {
        work_type_id: workTypeId,
        segment_type: data.segment_type,
        segment_order: data.segment_order,
        duration_hours: data.duration_hours,
        multiplier: data.multiplier,
        description: data.description || "",
      };
      return updateWorkTypeSegment(id, payload);
    },
    onSuccess: () => {
      successToast("Segmento actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, workTypeId] });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "Error al actualizar segmento",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (segmentId: number) => deleteWorkTypeSegment(segmentId),
    onSuccess: () => {
      successToast("Segmento eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, workTypeId] });
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "Error al eliminar segmento",
      );
    },
  });

  // Validations
  const validateSegments = () => {
    const errors: string[] = [];

    if (segments.length === 0) {
      errors.push("Debe agregar al menos un segmento");
      return errors;
    }

    const totalDuration = segments.reduce(
      (sum, seg) => sum + seg.duration_hours,
      0,
    );
    if (Math.abs(totalDuration - 12) > 0.01) {
      errors.push(
        `Los segmentos deben sumar exactamente 12 horas (actualmente: ${totalDuration.toFixed(2)}h)`,
      );
    }

    return errors;
  };

  const validationErrors = validateSegments();
  const isValid = validationErrors.length === 0 && segments.length > 0;

  const formatHour = (hour: number) => {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    return `${wholeHours}h ${minutes}m`;
  };

  const getSegmentColor = (segment: WorkTypeSegmentSchema) => {
    if (segment.segment_type === "BREAK") {
      return "bg-orange-500";
    }
    if (segment.multiplier > 1) {
      return "bg-green-500";
    }
    return "bg-blue-500";
  };

  const getSegmentPosition = (startHour: number, endHour: number) => {
    const totalHours = 12;
    const adjustedStart = startHour - shiftStart;
    let adjustedEnd = endHour - shiftStart;

    if (shiftType === "NIGHT" && endHour < startHour) {
      adjustedEnd += 24;
    }

    const left = (adjustedStart / totalHours) * 100;
    const width = ((adjustedEnd - adjustedStart) / totalHours) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const handleAddSegment = () => {
    const sortedSegments = [...segments].sort(
      (a, b) => a.start_hour - b.start_hour,
    );
    let nextStartHour = shiftStart;

    if (sortedSegments.length > 0) {
      const lastSegment = sortedSegments[sortedSegments.length - 1];
      nextStartHour = lastSegment.end_hour;
    }

    const newSegment: WorkTypeSegmentSchema = {
      segment_type: "WORK",
      segment_order: segments.length + 1,
      start_hour: nextStartHour,
      end_hour: Math.min(nextStartHour + 1, shiftType === "MORNING" ? 19 : 7),
      duration_hours: 1,
      multiplier: 1,
      description: "",
    };

    setEditingSegment(newSegment);
    setDialogOpen(true);
  };

  const handleEditSegment = (segment: WorkTypeSegmentSchema) => {
    setEditingSegment(segment);
    setDialogOpen(true);
  };

  const handleDeleteSegment = (segment: WorkTypeSegmentSchema) => {
    if (segment.id) {
      deleteMutation.mutate(segment.id);
    }
  };

  const handleSaveSegment = (segment: WorkTypeSegmentSchema) => {
    if (segment.id) {
      // Update existing
      updateMutation.mutate({ id: segment.id, data: segment });
    } else {
      // Create new
      createMutation.mutate(segment);
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Segmentos - Turno {shiftType === "MORNING" ? "Mañana" : "Noche"}
            </CardTitle>
            <Badge>
              {isValid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Válido
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" /> Incompleto
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {shiftType === "MORNING"
              ? "7:00 AM - 7:00 PM"
              : "7:00 PM - 7:00 AM"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Timeline visualization */}
          <div className="relative h-24 bg-muted rounded-lg border overflow-hidden">
            {/* Hour markers */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-muted-foreground/20 flex items-end justify-center pb-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {formatHour((shiftStart + i) % 24)}
                  </span>
                </div>
              ))}
            </div>

            {/* Segments */}
            <div className="absolute top-2 left-0 right-0 h-12">
              {segments.map((segment, index) => {
                const position = getSegmentPosition(
                  segment.start_hour,
                  segment.end_hour,
                );
                return (
                  <div
                    key={segment.id || index}
                    className={`absolute h-full ${getSegmentColor(segment)} rounded cursor-pointer transition-all hover:opacity-80`}
                    style={position}
                    onClick={() => handleEditSegment(segment)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium px-2">
                      <span className="truncate">
                        {segment.segment_type === "WORK"
                          ? "Trabajo"
                          : "Descanso"}{" "}
                        x{segment.multiplier}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Segments list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Segmentos ({segments.length})
              </h4>
              <Button
                type="button"
                size="sm"
                onClick={handleAddSegment}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Agregar Segmento
              </Button>
            </div>

            <div className="space-y-2">
              {segments
                .sort((a, b) => a.start_hour - b.start_hour)
                .map((segment, index) => (
                  <div
                    key={segment.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>
                        {segment.segment_type === "WORK"
                          ? "Trabajo"
                          : "Descanso"}
                      </Badge>
                      <div className="text-sm">
                        <p className="font-medium">
                          {formatHour(segment.start_hour)} -{" "}
                          {formatHour(segment.end_hour)}
                        </p>
                        <p className="text-muted-foreground">
                          {formatDuration(segment.duration_hours)} • Multiplicador:{" "}
                          {segment.multiplier}x
                          {segment.description && ` • ${segment.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditSegment(segment)}
                        disabled={isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSegment(segment)}
                        disabled={isPending || !segment.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {segments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay segmentos configurados</p>
                  <p className="text-sm">
                    Agregue segmentos para definir el turno
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Trabajo Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Horas Extra (multiplicador &gt; 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Descanso</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SegmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        segment={editingSegment}
        onSave={handleSaveSegment}
        shiftType={shiftType}
      />
    </div>
  );
};
