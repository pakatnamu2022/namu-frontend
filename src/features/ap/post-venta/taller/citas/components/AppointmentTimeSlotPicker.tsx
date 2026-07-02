import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { getAvailableSlots } from "../lib/appointmentPlanning.actions";
import { AvailableSlotsResponse } from "../lib/appointmentPlanning.interface";
import { cn } from "@/lib/utils";

// Estado visual de un horario agrupado. Centraliza aquí los colores y
// etiquetas para poder ajustarlos en un solo lugar en el futuro.
type SlotStatus = "libre" | "reservacion" | "entrega" | "ambos";

const SLOT_STATUS_STYLES: Record<
  SlotStatus,
  {
    label: (deliveryCount: number) => string;
    badge: string;
    card: { available: string; unavailable: string };
    dot: string;
  }
> = {
  libre: {
    label: () => "Disponible",
    badge: "bg-green-500",
    card: {
      available:
        "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer shadow-sm",
      unavailable:
        "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60",
    },
    dot: "bg-green-500",
  },
  reservacion: {
    label: () => "1 Cita",
    badge: "bg-primary",
    card: {
      available:
        "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer shadow-sm",
      unavailable:
        "bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed",
    },
    dot: "bg-primary",
  },
  entrega: {
    label: (deliveryCount) => `${deliveryCount} Entrega(s)`,
    badge: "bg-orange-500",
    card: {
      available:
        "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-500 hover:scale-105 cursor-pointer shadow-sm",
      unavailable:
        "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60",
    },
    dot: "bg-orange-500",
  },
  ambos: {
    label: (deliveryCount) => `1 Cita + ${deliveryCount} Entrega(s)`,
    badge: "bg-purple-500",
    card: {
      available:
        "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer shadow-sm",
      unavailable:
        "bg-purple-100 border-purple-300 text-purple-700 cursor-not-allowed",
    },
    dot: "bg-purple-500",
  },
};

const getSlotStatus = (group: {
  hasAppointment: boolean;
  deliveryCount: number;
}): SlotStatus => {
  if (group.hasAppointment && group.deliveryCount > 0) return "ambos";
  if (group.hasAppointment) return "reservacion";
  if (group.deliveryCount > 0) return "entrega";
  return "libre";
};

interface AppointmentTimeSlotPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  mode?: "appointment" | "delivery";
  appointmentDate?: string;
  appointmentTime?: string;
}

export default function AppointmentTimeSlotPicker({
  open,
  onClose,
  onSelect,
  mode = "appointment",
  appointmentDate,
  appointmentTime,
}: AppointmentTimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    AvailableSlotsResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  useEffect(() => {
    if (open) {
      loadSlots();
    }
  }, [open, currentWeekStart]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const slots = await getAvailableSlots({
        start_date: format(currentWeekStart, "yyyy-MM-dd"),
        end_date: format(weekEnd, "yyyy-MM-dd"),
      });
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i),
  );

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
    setSelectedDay(null);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
    setSelectedDay(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setViewMode("day");
  };

  const handleSlotClick = (
    date: string,
    time: string,
    isAvailable: boolean,
  ) => {
    if (isAvailable) {
      onSelect(date, time);
      onClose();
    }
  };

  const getSlotsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return availableSlots.find((s) => s.date === dateStr)?.slots || [];
  };

  // El backend ya entrega un único slot por horario con su `type`
  // ("Reservación" | "Entrega" | "Ambos" | null) y `deliveries_count`
  // calculados. Solo lo adaptamos a la forma que usa la UI.
  const getGroupedSlotsForDay = (day: Date) => {
    const slots = getSlotsForDay(day);
    return slots.map((slot) => {
      const hasAppointment =
        slot.type === "Reservación" || slot.type === "Ambos";
      const deliveryCount = slot.deliveries_count ?? 0;
      const time = slot.time;
      // Representante del grupo para conservar campos como advisor/date.
      const base = slot;
      return { time, base, hasAppointment, deliveryCount };
    });
  };

  // Para modo entrega: verifica si un día es anterior a la fecha de cita
  const isDayBeforeAppointment = (day: Date): boolean => {
    if (mode !== "delivery" || !appointmentDate) return false;
    const apptDay = new Date(appointmentDate + "T00:00:00");
    const dayNormalized = new Date(format(day, "yyyy-MM-dd") + "T00:00:00");
    return dayNormalized < apptDay;
  };

  const isTimeSlotPast = (time: string, day: Date): boolean => {
    const isToday = isSameDay(day, new Date());
    if (!isToday) return false;

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(day);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < now;
  };

  // Para modo entrega: verifica si un horario está bloqueado por ser
  // igual/anterior a la hora de la cita (recibe la hora directamente).
  const isTimeBlockedByAppointment = (time: string, day: Date): boolean => {
    if (mode !== "delivery" || !appointmentDate || !appointmentTime)
      return false;
    const dayStr = format(day, "yyyy-MM-dd");
    if (dayStr !== appointmentDate) return false;
    const [apptH, apptM] = appointmentTime.split(":").map(Number);
    const [slotH, slotM] = time.split(":").map(Number);
    return slotH * 60 + slotM <= apptH * 60 + apptM;
  };

  const renderWeekView = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousWeek}
          className="hover:bg-white/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">Semana del</p>
          <p className="text-lg font-bold text-gray-800">
            {format(currentWeekStart, "dd MMM", { locale: es })} -{" "}
            {format(
              endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
              "dd MMM yyyy",
              {
                locale: es,
              },
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="hover:bg-white/60"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week Days Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const groupedSlots = getGroupedSlotsForDay(day);
          const availableCount = groupedSlots.filter((group) => {
            if (isTimeSlotPast(group.time, day)) return false;
            if (
              mode === "delivery" &&
              isTimeBlockedByAppointment(group.time, day)
            )
              return false;
            return !group.hasAppointment;
          }).length;
          const totalSlots = groupedSlots.length;
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date() && !isToday;
          const isBeforeAppointment = isDayBeforeAppointment(day);
          const isDisabled = isPast || isBeforeAppointment;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled || loading}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                "flex flex-col items-center justify-center space-y-2",
                isDisabled
                  ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                  : availableCount > 0
                    ? "bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer"
                    : "bg-red-50 border-red-200 opacity-75 cursor-not-allowed",
                isToday && "ring-2 ring-primary ring-offset-2",
              )}
            >
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Hoy
                </span>
              )}
              <Calendar
                className={cn(
                  "h-6 w-6",
                  isDisabled ? "text-gray-400" : "text-primary",
                )}
              />
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {format(day, "dd")}
                </p>
                <p className="text-xs text-gray-500">
                  {format(day, "MMM", { locale: es })}
                </p>
              </div>
              <div className="mt-2 w-full">
                {!isDisabled && (
                  <div className="flex items-center justify-center space-x-1">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        availableCount > 0 ? "bg-green-500" : "bg-red-500",
                      )}
                    />
                    <span className="text-xs font-semibold">
                      {availableCount}/{totalSlots}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    if (!selectedDay) return null;

    const groupedSlots = getGroupedSlotsForDay(selectedDay);
    const morningSlots = groupedSlots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour < 12;
    });
    const afternoonSlots = groupedSlots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour >= 12;
    });

    // Un grupo es seleccionable si: no pasó, no lo bloquea la hora de la
    // cita (modo entrega) y, en modo entrega, no hay una reservación (cita)
    // ya agendada en ese horario (aunque sí haya entregas agendadas, esas
    // no bloquean, solo se muestran como contador).
    const isGroupAvailable = (group: {
      time: string;
      hasAppointment: boolean;
    }): boolean => {
      const isPast = isTimeSlotPast(group.time, selectedDay);
      if (isPast) return false;
      if (mode === "delivery") {
        if (isTimeBlockedByAppointment(group.time, selectedDay)) return false;
        return !group.hasAppointment;
      }
      return !group.hasAppointment;
    };

    return (
      <div className="space-y-6">
        {/* Day Header */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setViewMode("week")}
              className="text-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver a semana
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-500 font-medium">
                Selecciona tu horario
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {format(selectedDay, "EEEE, dd 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="w-24" />
          </div>
        </div>

        {/* Time Slots */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="bg-yellow-400 p-1.5 rounded-full">
                <Clock className="h-4 w-4 text-yellow-900" />
              </div>
              <h3 className="font-semibold text-gray-800">Mañana</h3>
              <span className="text-sm text-gray-600">
                ({morningSlots.filter(isGroupAvailable).length} disponibles)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
              {morningSlots.map((group) => {
                const isAvailable = isGroupAvailable(group);
                const status = getSlotStatus(group);
                const styles = SLOT_STATUS_STYLES[status];

                return (
                  <button
                    key={group.time}
                    onClick={() =>
                      handleSlotClick(group.base.date, group.time, isAvailable)
                    }
                    disabled={!isAvailable}
                    title={styles.label(group.deliveryCount)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center justify-center font-semibold text-sm",
                      isAvailable
                        ? styles.card.available
                        : styles.card.unavailable,
                    )}
                  >
                    {isAvailable ? (
                      <>
                        <Check className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                        {group.deliveryCount > 0 && (
                          <div
                            className={cn(
                              "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                              styles.badge,
                            )}
                          >
                            {group.deliveryCount}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                            styles.badge,
                          )}
                        >
                          {group.hasAppointment ? "R" : group.deliveryCount}
                        </div>
                        <X className="h-3 w-3 absolute top-1 right-1 text-red-500" />
                      </>
                    )}
                    <span>{group.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <div className="bg-orange-400 p-1.5 rounded-full">
                <Clock className="h-4 w-4 text-orange-900" />
              </div>
              <h3 className="font-semibold text-gray-800">Tarde</h3>
              <span className="text-sm text-gray-600">
                ({afternoonSlots.filter(isGroupAvailable).length} disponibles)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
              {afternoonSlots.map((group) => {
                const isAvailable = isGroupAvailable(group);
                const status = getSlotStatus(group);
                const styles = SLOT_STATUS_STYLES[status];

                return (
                  <button
                    key={group.time}
                    onClick={() =>
                      handleSlotClick(group.base.date, group.time, isAvailable)
                    }
                    disabled={!isAvailable}
                    title={styles.label(group.deliveryCount)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center justify-center font-semibold text-sm",
                      isAvailable
                        ? styles.card.available
                        : styles.card.unavailable,
                    )}
                  >
                    {isAvailable ? (
                      <>
                        <Check className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                        {group.deliveryCount > 0 && (
                          <div
                            className={cn(
                              "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                              styles.badge,
                            )}
                          >
                            {group.deliveryCount}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                            styles.badge,
                          )}
                        >
                          {group.hasAppointment ? "R" : group.deliveryCount}
                        </div>
                        <X className="h-3 w-3 absolute top-1 right-1 text-red-500" />
                      </>
                    )}
                    <span>{group.time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] xl:max-w-[1600px] max-h-[95vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Selecciona Fecha y Hora de tu Cita</span>
          </DialogTitle>
          <DialogDescription>
            Elige el día y la hora que mejor se ajuste a tu agenda. Los horarios
            en verde están disponibles.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="mt-4">
            {viewMode === "week" ? renderWeekView() : renderDayView()}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-gray-300">
            <div className="flex items-center space-x-2">
              <div
                className={cn("h-4 w-4 rounded", SLOT_STATUS_STYLES.libre.dot)}
              />
              <span className="text-sm text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "h-4 w-4 rounded",
                  SLOT_STATUS_STYLES.reservacion.dot,
                )}
              />
              <span className="text-sm text-gray-600">Reservación</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "h-4 w-4 rounded",
                  SLOT_STATUS_STYLES.entrega.dot,
                )}
              />
              <span className="text-sm text-gray-600">Entrega(s)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={cn("h-4 w-4 rounded", SLOT_STATUS_STYLES.ambos.dot)}
              />
              <span className="text-sm text-gray-600">
                Reservación + Entrega(s)
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
