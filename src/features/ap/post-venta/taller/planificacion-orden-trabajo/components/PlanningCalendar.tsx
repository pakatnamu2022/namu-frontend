"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_COLORS,
} from "../lib/workOrderPlanning.interface";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Maximize2 } from "lucide-react";
import { WorkerTimelineView } from "./WorkerTimelineView";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface PlanningCalendarProps {
  data: WorkOrderPlanningResource[];
  onPlanningClick?: (planning: WorkOrderPlanningResource) => void;
  sedeId?: string;
  onRefresh?: () => void;
}

export function PlanningCalendar({
  data,
  onPlanningClick,
  sedeId,
  onRefresh,
}: PlanningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayForTimeline, setSelectedDayForTimeline] =
    useState<Date | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPlanningsForDay = (day: Date) => {
    return data.filter((planning) => {
      if (!planning.planned_start_datetime) return false;
      const planningDate = parseISO(planning.planned_start_datetime);
      return isSameDay(planningDate, day);
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleExpandDay = (day: Date) => {
    setSelectedDayForTimeline(day);
    setShowTimeline(true);
  };

  const handleBackToCalendar = () => {
    setShowTimeline(false);
    setSelectedDayForTimeline(null);
  };

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Si está en modo timeline, mostrar la vista de timeline
  if (showTimeline && selectedDayForTimeline) {
    return (
      <WorkerTimelineView
        selectedDate={selectedDayForTimeline}
        data={data}
        onPlanningClick={onPlanningClick}
        onBack={handleBackToCalendar}
        sedeId={sedeId}
        onRefresh={onRefresh}
      />
    );
  }

  // Vista normal del calendario
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendario de Planificación</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold p-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {daysInMonth.map((day) => {
            const plannings = getPlanningsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isCurrentDay
                    ? "bg-blue-50 border-blue-300"
                    : "bg-background border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-sm font-semibold ${
                      isCurrentDay ? "text-blue-600" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {plannings.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-primary/10"
                      onClick={() => handleExpandDay(day)}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  {plannings.map((planning) => (
                    <HoverCard key={planning.id}>
                      <HoverCardTrigger asChild>
                        <div
                          onClick={() => onPlanningClick?.(planning)}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            PLANNING_STATUS_COLORS[planning.status].bg
                          } ${
                            PLANNING_STATUS_COLORS[planning.status].text
                          } hover:opacity-80 transition-opacity`}
                        >
                          <div className="truncate font-medium">
                            {planning.worker_name.split(" ")[0]}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            <span>
                              {planning.estimated_hours
                                ? `${planning.estimated_hours}h`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">
                              {planning.worker_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              OT: {planning.work_order_correlative}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {planning.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Estimado:
                              </span>
                              <p className="font-medium">
                                {planning.estimated_hours || "N/A"} horas
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Real:
                              </span>
                              <p className="font-medium">
                                {planning.actual_hours} horas
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              PLANNING_STATUS_COLORS[planning.status].bg
                            } ${PLANNING_STATUS_COLORS[planning.status].text}`}
                          >
                            {planning.status}
                          </Badge>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
