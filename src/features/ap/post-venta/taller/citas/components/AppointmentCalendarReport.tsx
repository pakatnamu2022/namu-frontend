import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Car,
  CheckCircle2,
  CircleDashed,
  X,
  ListChecks,
} from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { getCalendarAppointments } from "../lib/appointmentPlanning.actions";
import {
  CalendarAppointment,
  CalendarAppointmentsResponse,
} from "../lib/appointmentPlanning.interface";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { MetricCard } from "@/shared/components/MetricCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { errorToast } from "@/core/core.function";
import AppointmentStatusChart from "./AppointmentStatusChart";
import AppointmentTypePlanningChart from "./AppointmentTypePlanningChart";
import { CopyCell } from "@/shared/components/CopyCell";

interface AppointmentCalendarReportProps {
  asesores: WorkerResource[];
  isLoadingAsesores: boolean;
  sedeId: string;
}

type PeriodMode = "month" | "week";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function AppointmentCalendarReport({
  asesores,
  isLoadingAsesores,
  sedeId,
}: AppointmentCalendarReportProps) {
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [monthPickerYear, setMonthPickerYear] = useState(
    new Date().getFullYear(),
  );
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [data, setData] = useState<CalendarAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  const rangeStart = useMemo(
    () =>
      periodMode === "month" ? startOfMonth(currentMonth) : currentWeekStart,
    [periodMode, currentMonth, currentWeekStart],
  );
  const rangeEnd = useMemo(
    () =>
      periodMode === "month"
        ? endOfMonth(currentMonth)
        : endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [periodMode, currentMonth, currentWeekStart],
  );

  useEffect(() => {
    if (!sedeId) return;
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd, sedeId, selectedAdvisor]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedDay) {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedDay]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await getCalendarAppointments({
        start_date: format(rangeStart, "yyyy-MM-dd"),
        end_date: format(rangeEnd, "yyyy-MM-dd"),
        sede_id: sedeId,
        advisor_id: selectedAdvisor || undefined,
      });
      setData(response);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const appointments = data?.appointments ?? [];

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return appointments
      .filter((a) => a.date_appointment === dateStr)
      .sort((a, b) => a.time_appointment.localeCompare(b.time_appointment));
  };

  // Grilla del mes alineada a semanas completas (lunes a domingo).
  const monthDays = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(currentMonth), {
      weekStartsOn: 1,
    });
    const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentMonth]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  const handlePrevious = () => {
    if (periodMode === "month") {
      setCurrentMonth((m) => addMonths(m, -1));
    } else {
      setCurrentWeekStart((w) => addDays(w, -7));
    }
  };

  const handleNext = () => {
    if (periodMode === "month") {
      setCurrentMonth((m) => addMonths(m, 1));
    } else {
      setCurrentWeekStart((w) => addDays(w, 7));
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentMonth(new Date(monthPickerYear, monthIndex, 1));
    setMonthPickerOpen(false);
  };

  const periodLabel =
    periodMode === "month"
      ? format(currentMonth, "MMMM yyyy", { locale: es })
      : `${format(currentWeekStart, "dd MMM", { locale: es })} - ${format(
          endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
          "dd MMM yyyy",
          { locale: es },
        )}`;

  const selectedDayAppointments = selectedDay
    ? getAppointmentsForDay(selectedDay)
    : [];

  if (!sedeId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <CalendarIcon className="h-8 w-8 text-gray-300" />
        <p className="text-gray-500">
          Selecciona una sede para ver el calendario de citas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros compactos */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
          <Button
            variant={periodMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriodMode("month")}
          >
            Mes
          </Button>
          <Button
            variant={periodMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriodMode("week")}
          >
            Semana
          </Button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {periodMode === "month" ? (
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-40 capitalize"
                >
                  {periodLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setMonthPickerYear((y) => y - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm font-medium">{monthPickerYear}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setMonthPickerYear((y) => y + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-52">
                  {MONTH_LABELS.map((label, index) => {
                    const isSelected =
                      currentMonth.getFullYear() === monthPickerYear &&
                      currentMonth.getMonth() === index;
                    return (
                      <Button
                        key={label}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectMonth(index)}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-sm font-medium min-w-40 text-center capitalize">
              {periodLabel}
            </span>
          )}

          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <SearchableSelect
          options={asesores.map((a) => ({
            value: String(a.id),
            label: a.name,
          }))}
          value={selectedAdvisor}
          onChange={setSelectedAdvisor}
          placeholder={
            isLoadingAsesores ? "Cargando asesores..." : "Todos los asesores"
          }
          className="min-w-56 w-auto"
          classNameOption="text-xs"
        />

        {data && (
          <span className="ml-auto text-sm text-gray-500 shrink-0">
            {data.total} {data.total === 1 ? "cita" : "citas"} en el período
          </span>
        )}
      </div>

      {/* Indicadores */}
      {data && data.total > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total citas"
              value={data.total}
              subtitle="En el período seleccionado"
              icon={ListChecks}
              variant="outline"
              color="gray"
            />
            <MetricCard
              title="Tomadas"
              value={data.statistics.total_taken}
              subtitle={`${data.statistics.percentage_taken}% del total`}
              icon={CheckCircle2}
              variant="outline"
              color="blue"
              showProgress
              progressValue={data.statistics.percentage_taken}
              progressMax={100}
            />
            <MetricCard
              title="Pendientes"
              value={data.statistics.total_not_taken}
              subtitle={`${data.statistics.percentage_not_taken}% del total`}
              icon={CircleDashed}
              variant="outline"
              color="orange"
              showProgress
              progressValue={data.statistics.percentage_not_taken}
              progressMax={100}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AppointmentStatusChart statistics={data.statistics} />
            <AppointmentTypePlanningChart
              data={data.consolidated_by_type_planning}
            />
          </div>
        </>
      )}

      {/* Calendario */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-semibold text-gray-500 uppercase py-1"
            >
              {label}
            </div>
          ))}

          {(periodMode === "month" ? monthDays : weekDays).map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = !!selectedDay && isSameDay(day, selectedDay);
            const isCurrentMonth =
              periodMode === "week" || isSameMonth(day, currentMonth);
            const visibleAppointments = dayAppointments.slice(0, 3);
            const hiddenCount =
              dayAppointments.length - visibleAppointments.length;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex flex-col items-stretch rounded-lg border p-1.5 text-left transition-colors",
                  periodMode === "month" ? "min-h-24" : "min-h-40",
                  !isCurrentMonth && "opacity-40 bg-gray-50",
                  isCurrentMonth &&
                    "bg-white hover:border-blue-300 hover:bg-blue-50/40",
                  isSelected &&
                    "border-primary ring-2 ring-primary bg-primary/5 shadow-sm",
                )}
              >
                {isToday && !isSelected && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold mb-1",
                    isToday || isSelected ? "text-primary" : "text-gray-600",
                  )}
                >
                  {format(day, "dd")}
                </span>
                <div className="flex-1 space-y-1">
                  {visibleAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "text-[11px] leading-tight rounded px-1.5 py-1 truncate",
                        appointment.is_taken
                          ? "bg-primary/10 text-primary"
                          : "bg-orange-50 text-orange-700",
                      )}
                      title={`${appointment.time_appointment?.slice(0, 5)} - ${appointment.full_name_client}`}
                    >
                      <span className="font-semibold">
                        {appointment.time_appointment?.slice(0, 5)}
                      </span>{" "}
                      {appointment.full_name_client}
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <div className="text-[11px] text-gray-500 px-1.5">
                      +{hiddenCount} más
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      {selectedDay && (
        <div
          ref={detailRef}
          className="border border-primary/40 rounded-lg overflow-hidden ring-1 ring-primary/20 scroll-mt-4"
        >
          <div className="flex items-center justify-between bg-primary/5 px-4 py-3 border-b border-primary/20">
            <p className="font-semibold text-gray-800 capitalize">
              {format(selectedDay, "EEEE, dd 'de' MMMM yyyy", { locale: es })}{" "}
              <span className="font-normal text-gray-500">
                ({selectedDayAppointments.length}{" "}
                {selectedDayAppointments.length === 1 ? "cita" : "citas"})
              </span>
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setSelectedDay(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedDayAppointments.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {selectedDayAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay citas registradas este día
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ appointment }: { appointment: CalendarAppointment }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-1.5 w-16 shrink-0 text-sm font-semibold text-gray-800">
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        {appointment.time_appointment?.slice(0, 5)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {appointment.full_name_client}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {appointment.type_operation}
        </p>
        {appointment.is_taken && appointment.work_order_number && (
          <CopyCell
            value={appointment.work_order_number}
            className="text-xs text-gray-500"
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-600 shrink-0">
        <Car className="h-3.5 w-3.5 text-gray-400" />
        {appointment.plate}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-600 w-44 shrink-0 truncate">
        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span className="truncate">
          {appointment.advisor_name ?? "Sin asesor"}
        </span>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0",
          appointment.is_taken
            ? "bg-primary/10 text-primary"
            : "bg-orange-50 text-orange-600",
        )}
      >
        {appointment.is_taken ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <CircleDashed className="h-3.5 w-3.5" />
        )}
        {appointment.is_taken ? "Tomada" : "Pendiente"}
      </div>
    </div>
  );
}
