"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { WorkTypeSegmentSchema } from "../lib/work-type.schema";
import { ShiftType } from "../lib/work-type.interface";
import { SegmentDialog } from "./SegmentDialog";

interface TimelineSegmentEditorProps {
  shiftType: ShiftType;
  segments: WorkTypeSegmentSchema[];
  onChange: (segments: WorkTypeSegmentSchema[]) => void;
}

export const TimelineSegmentEditor = ({
  shiftType,
  segments,
  onChange,
}: TimelineSegmentEditorProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<WorkTypeSegmentSchema | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const shiftStart = shiftType === "MORNING" ? 7 : 19;
  const shiftEnd = shiftType === "MORNING" ? 19 : 7; // Next day for night shift

  useEffect(() => {
    validateSegments();
  }, [segments]);

  const validateSegments = () => {
    const errors: string[] = [];

    if (segments.length === 0) {
      errors.push("Debe agregar al menos un segmento");
      setValidationErrors(errors);
      return;
    }

    // Sort segments by start_hour
    const sortedSegments = [...segments].sort((a, b) => a.start_hour - b.start_hour);

    // Check for overlaps
    for (let i = 0; i < sortedSegments.length - 1; i++) {
      const current = sortedSegments[i];
      const next = sortedSegments[i + 1];

      if (current.end_hour > next.start_hour) {
        errors.push(`Los segmentos se traslapan entre ${formatHour(current.start_hour)} y ${formatHour(next.start_hour)}`);
      }
    }

    // Check if segments cover the full 12 hours
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration_hours, 0);
    if (Math.abs(totalDuration - 12) > 0.01) {
      errors.push(`Los segmentos deben sumar exactamente 12 horas (actualmente: ${totalDuration.toFixed(2)}h)`);
    }

    // Check if there are gaps
    if (sortedSegments.length > 0) {
      let currentHour = shiftStart;
      for (const segment of sortedSegments) {
        if (segment.start_hour !== currentHour) {
          errors.push(`Hay un espacio sin cubrir entre ${formatHour(currentHour)} y ${formatHour(segment.start_hour)}`);
        }
        currentHour = segment.end_hour;
      }

      // Check last segment
      const expectedEnd = shiftType === "MORNING" ? 19 : 7;
      if (sortedSegments[sortedSegments.length - 1].end_hour !== expectedEnd) {
        errors.push(`El último segmento debe terminar a las ${formatHour(expectedEnd)}`);
      }
    }

    setValidationErrors(errors);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getSegmentColor = (segment: WorkTypeSegmentSchema) => {
    if (segment.segment_type === "BREAK") {
      return "bg-orange-500 hover:bg-orange-600";
    }
    if (segment.multiplier > 1) {
      return "bg-green-500 hover:bg-green-600";
    }
    return "bg-blue-500 hover:bg-blue-600";
  };

  const getSegmentPosition = (startHour: number, endHour: number) => {
    const totalHours = 12;
    const shiftStart = shiftType === "MORNING" ? 7 : 19;

    let adjustedStart = startHour - shiftStart;
    let adjustedEnd = endHour - shiftStart;

    if (shiftType === "NIGHT") {
      if (startHour < 19) adjustedStart += 24;
      if (endHour < 19) adjustedEnd += 24;
    }

    const left = (adjustedStart / totalHours) * 100;
    const width = ((adjustedEnd - adjustedStart) / totalHours) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const handleAddSegment = () => {
    // Find the next available hour
    const sortedSegments = [...segments].sort((a, b) => a.start_hour - b.start_hour);
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
      tempId: `temp-${Date.now()}`,
    };

    setEditingSegment(newSegment);
    setDialogOpen(true);
  };

  const handleEditSegment = (segment: WorkTypeSegmentSchema) => {
    setEditingSegment(segment);
    setDialogOpen(true);
  };

  const handleDeleteSegment = (segment: WorkTypeSegmentSchema) => {
    const newSegments = segments.filter(
      (s) => (s.id || s.tempId) !== (segment.id || segment.tempId)
    );
    onChange(newSegments);
  };

  const handleSaveSegment = (segment: WorkTypeSegmentSchema) => {
    // Check if the segment exists in the array
    const segmentExists = segments.some(
      (s) => (s.id || s.tempId) === (editingSegment?.id || editingSegment?.tempId)
    );

    if (segmentExists) {
      // Update existing segment
      const newSegments = segments.map((s) =>
        (s.id || s.tempId) === (editingSegment?.id || editingSegment?.tempId)
          ? { ...segment, id: s.id, tempId: s.tempId }
          : s
      );
      onChange(newSegments);
    } else {
      // Add new segment
      const newSegmentWithId = {
        ...segment,
        id: editingSegment?.id,
        tempId: editingSegment?.tempId || `temp-${Date.now()}`,
      };
      onChange([...segments, newSegmentWithId]);
    }
    setEditingSegment(null);
  };

  const isValid = validationErrors.length === 0 && segments.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Configuración de Segmentos - Turno {shiftType === "MORNING" ? "Mañana" : "Noche"}
            </CardTitle>
            <Badge variant={isValid ? "default" : "destructive"}>
              {isValid ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Válido</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" /> Incompleto</>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {shiftType === "MORNING" ? "7:00 AM - 7:00 PM" : "7:00 PM - 7:00 AM"}
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
                const position = getSegmentPosition(segment.start_hour, segment.end_hour);
                return (
                  <TooltipProvider key={segment.id || segment.tempId || index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute h-full ${getSegmentColor(segment)} rounded cursor-pointer transition-all group`}
                          style={position}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditSegment(segment);
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium px-2">
                            <span className="truncate">
                              {segment.segment_type === "WORK" ? "Trabajo" : "Descanso"} x{segment.multiplier}
                            </span>
                          </div>
                          <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSegment(segment);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {formatHour(segment.start_hour)} - {formatHour(segment.end_hour)}
                          </p>
                          <p className="text-xs">
                            {segment.segment_type === "WORK" ? "Trabajo" : "Descanso"} •
                            Multiplicador: {segment.multiplier} •
                            Duración: {segment.duration_hours}h
                          </p>
                          {segment.description && (
                            <p className="text-xs italic">{segment.description}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
              <h4 className="text-sm font-medium">Segmentos ({segments.length})</h4>
              <Button
                type="button"
                size="sm"
                onClick={handleAddSegment}
                disabled={segments.length > 0 && !isValid}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Segmento
              </Button>
            </div>

            <div className="space-y-2">
              {segments
                .sort((a, b) => a.start_hour - b.start_hour)
                .map((segment, index) => (
                  <div
                    key={segment.id || segment.tempId || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={segment.segment_type === "WORK" ? "default" : "secondary"}
                      >
                        {segment.segment_type === "WORK" ? "Trabajo" : "Descanso"}
                      </Badge>
                      <div className="text-sm">
                        <p className="font-medium">
                          {formatHour(segment.start_hour)} - {formatHour(segment.end_hour)}
                        </p>
                        <p className="text-muted-foreground">
                          {segment.duration_hours}h • Multiplicador: {segment.multiplier}x
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSegment(segment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {segments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay segmentos configurados</p>
                  <p className="text-sm">Agregue segmentos para definir el turno</p>
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
