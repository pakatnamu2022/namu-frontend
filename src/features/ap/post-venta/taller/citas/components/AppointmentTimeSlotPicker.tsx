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
import {
  AvailableSlotsResponse,
  TimeSlot,
} from "../lib/appointmentPlanning.interface";
import { cn } from "@/lib/utils";

interface AppointmentTimeSlotPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export default function AppointmentTimeSlotPicker({
  open,
  onClose,
  onSelect,
}: AppointmentTimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
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
    addDays(currentWeekStart, i)
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

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      onSelect(slot.date, slot.time);
      onClose();
    }
  };

  const getSlotsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return availableSlots.find((s) => s.date === dateStr)?.slots || [];
  };

  const getAvailableCount = (day: Date) => {
    const slots = getSlotsForDay(day);
    return slots.filter((s) => s.available).length;
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
              }
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
          const availableCount = getAvailableCount(day);
          const totalSlots = getSlotsForDay(day).length;
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date() && !isToday;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && handleDayClick(day)}
              disabled={isPast || loading}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                "flex flex-col items-center justify-center space-y-2",
                isPast
                  ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                  : availableCount > 0
                  ? "bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer"
                  : "bg-red-50 border-red-200 opacity-75 cursor-not-allowed",
                isToday && "ring-2 ring-primary ring-offset-2"
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
                  isPast ? "text-gray-400" : "text-primary"
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
                {!isPast && (
                  <div className="flex items-center justify-center space-x-1">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        availableCount > 0 ? "bg-green-500" : "bg-red-500"
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

  const isTimeSlotPast = (slot: TimeSlot, day: Date): boolean => {
    const isToday = isSameDay(day, new Date());
    if (!isToday) return false;

    const now = new Date();
    const [hours, minutes] = slot.time.split(":").map(Number);
    const slotDate = new Date(day);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < now;
  };

  const renderDayView = () => {
    if (!selectedDay) return null;

    const slots = getSlotsForDay(selectedDay);
    const morningSlots = slots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour < 12;
    });
    const afternoonSlots = slots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour >= 12;
    });

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
                ({morningSlots.filter((s) => s.available).length} disponibles)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
              {morningSlots.map((slot) => {
                const isPast = isTimeSlotPast(slot, selectedDay);
                const isAvailable = slot.available && !isPast;

                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!isAvailable}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center justify-center font-semibold text-sm",
                      isAvailable
                        ? "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer shadow-sm"
                        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    {isAvailable ? (
                      <Check className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                    ) : (
                      <>
                        <div
                          className={cn(
                            "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                            slot.type === "Entrega"
                              ? "bg-green-500"
                              : "bg-primary"
                          )}
                        >
                          {slot.type === "Entrega" ? "E" : "R"}
                        </div>
                        <X className="h-3 w-3 absolute top-1 right-1 text-red-500" />
                      </>
                    )}
                    <span>{slot.time}</span>
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
                ({afternoonSlots.filter((s) => s.available).length} disponibles)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
              {afternoonSlots.map((slot) => {
                const isPast = isTimeSlotPast(slot, selectedDay);
                const isAvailable = slot.available && !isPast;

                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!isAvailable}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center justify-center font-semibold text-sm",
                      isAvailable
                        ? "bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer shadow-sm"
                        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    {isAvailable ? (
                      <Check className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                    ) : (
                      <>
                        <div
                          className={cn(
                            "absolute top-1 left-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                            slot.type === "Entrega"
                              ? "bg-red-500"
                              : "bg-primary"
                          )}
                        >
                          {slot.type === "Entrega" ? "E" : "R"}
                        </div>
                        <X className="h-3 w-3 absolute top-1 right-1 text-red-500" />
                      </>
                    )}
                    <span>{slot.time}</span>
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
          <div className="flex items-center justify-center space-x-6 border-gray-300">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                R
              </div>
              <span className="text-sm text-gray-600">Reservación</span>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  E
                </div>
                <span className="text-sm text-gray-600">Entrega</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
