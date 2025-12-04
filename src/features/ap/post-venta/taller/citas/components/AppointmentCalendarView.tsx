import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  ChevronsUpDown,
  Check,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { getAvailableSlots } from "../lib/appointmentPlanning.actions";
import {
  AvailableSlotsResponse,
  TimeSlot,
} from "../lib/appointmentPlanning.interface";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkerResource } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

interface AppointmentCalendarViewProps {
  asesores: WorkerResource[];
  isLoadingAsesores: boolean;
}

export default function AppointmentCalendarView({
  asesores,
  isLoadingAsesores,
}: AppointmentCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");
  const [availableSlots, setAvailableSlots] = useState<
    AvailableSlotsResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [openAdvisorSelect, setOpenAdvisorSelect] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [currentWeekStart]);

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

  const getSlotsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const daySlots =
      availableSlots.find((s) => s.date === dateStr)?.slots || [];

    if (selectedAdvisor === "all") {
      return daySlots;
    }

    return daySlots.filter(
      (slot) => slot.advisor_id === parseInt(selectedAdvisor)
    );
  };

  const getOccupiedCount = (day: Date) => {
    const slots = getSlotsForDay(day);
    return slots.filter((s) => !s.available).length;
  };

  const getTotalSlots = (day: Date) => {
    return getSlotsForDay(day).length;
  };

  const getSlotsByType = (slots: TimeSlot[], type: string) => {
    return slots.filter((s) => !s.available && s.type === type);
  };

  const renderWeekView = () => (
    <div className="space-y-6">
      {/* Week Navigation and Advisor Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 flex-1">
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

        {/* Advisor Filter */}
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-gray-200 min-w-[280px]">
          <Filter className="h-5 w-5 text-gray-500" />
          <Popover open={openAdvisorSelect} onOpenChange={setOpenAdvisorSelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="flex-1 justify-between"
              >
                <span className="truncate">
                  {selectedAdvisor === "all"
                    ? "Todos los asesores"
                    : asesores.find((a) => String(a.id) === selectedAdvisor)
                        ?.name || "Seleccionar asesor"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[280px]">
              <Command>
                <CommandInput placeholder="Buscar asesor..." />
                <CommandList className="max-h-60 overflow-y-auto">
                  {isLoadingAsesores ? (
                    <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty className="py-4 text-center text-sm">
                        No se encontraron asesores.
                      </CommandEmpty>
                      <CommandItem
                        onSelect={() => {
                          setSelectedAdvisor("all");
                          setOpenAdvisorSelect(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedAdvisor === "all"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Todos los asesores
                      </CommandItem>
                      {asesores.map((asesor) => (
                        <CommandItem
                          key={asesor.id}
                          onSelect={() => {
                            setSelectedAdvisor(String(asesor.id));
                            setOpenAdvisorSelect(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedAdvisor === String(asesor.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {asesor.name}
                        </CommandItem>
                      ))}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Week Days Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const occupiedCount = getOccupiedCount(day);
          const totalSlots = getTotalSlots(day);
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
                  : occupiedCount > 0
                  ? "bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer"
                  : "bg-gray-50 border-gray-200 opacity-75 cursor-pointer hover:border-gray-400",
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
                        occupiedCount > 0 ? "bg-orange-500" : "bg-gray-300"
                      )}
                    />
                    <span className="text-xs font-semibold">
                      {occupiedCount}/{totalSlots}
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

    const slots = getSlotsForDay(selectedDay);
    const occupiedSlots = slots.filter((s) => !s.available);

    const morningSlots = occupiedSlots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour < 12;
    });

    const afternoonSlots = occupiedSlots.filter((s) => {
      const hour = parseInt(s.time.split(":")[0]);
      return hour >= 12;
    });

    // Agrupar por asesor
    const slotsByAdvisor = occupiedSlots.reduce((acc, slot) => {
      if (!acc[slot.advisor_id]) {
        acc[slot.advisor_id] = {
          name: slot.advisor_name,
          slots: [],
        };
      }
      acc[slot.advisor_id].slots.push(slot);
      return acc;
    }, {} as Record<number, { name: string; slots: TimeSlot[] }>);

    return (
      <div className="space-y-6">
        {/* Day Header */}
        <div className="gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
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
                Reservaciones del día
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {format(selectedDay, "EEEE, dd 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="w-24" />
          </div>
        </div>

        {/* Reservations by Time Period */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="bg-yellow-400 p-1.5 rounded-full">
                <Clock className="h-4 w-4 text-yellow-900" />
              </div>
              <h3 className="font-semibold text-gray-800">Mañana</h3>
              <span className="text-sm text-gray-600">
                ({morningSlots.length} reservaciones)
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {morningSlots.length > 0 ? (
                morningSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                            slot.type === "Entrega"
                              ? "bg-red-500"
                              : "bg-primary"
                          )}
                        >
                          {slot.type === "Entrega" ? "E" : "R"}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {slot.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{slot.advisor_name}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{slot.type}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No hay reservaciones en la mañana
                </p>
              )}
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
                ({afternoonSlots.length} reservaciones)
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {afternoonSlots.length > 0 ? (
                afternoonSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                            slot.type === "Entrega"
                              ? "bg-red-500"
                              : "bg-primary"
                          )}
                        >
                          {slot.type === "Entrega" ? "E" : "R"}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {slot.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{slot.advisor_name}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{slot.type}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No hay reservaciones en la tarde
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reservations by Advisor */}
        {selectedAdvisor === "all" &&
          Object.keys(slotsByAdvisor).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Reservaciones por Asesor</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(slotsByAdvisor).map(([advisorId, data]) => (
                  <div
                    key={advisorId}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {data.name}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-primary font-medium">
                        Total Citas:{" "}
                        {getSlotsByType(data.slots, "Entrega").length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  };

  if (loading && availableSlots.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "week" ? renderWeekView() : renderDayView()}

      {/* Legend */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <span className="text-sm text-gray-600">Entrega</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              R
            </div>
            <span className="text-sm text-gray-600">Reservación</span>
          </div>
        </div>
      </div>
    </div>
  );
}
