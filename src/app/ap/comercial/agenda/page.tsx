"use client";

import { useMemo, useEffect } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import type { CalendarDayData } from "@/shared/components/CalendarGrid";
import { useCalendarMonth, useCalendarYear } from "@/shared/components/CalendarGrid";
import { useMyAgenda } from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import AgendaActions from "@/features/ap/comercial/agenda/components/AgendaActions";
import AgendaCalendarCard from "@/features/ap/comercial/agenda/components/AgendaCalendarCard";
import AgendaDayDetails from "@/features/ap/comercial/agenda/components/AgendaDayDetails";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useCommercialFiltersStore } from "@/features/ap/comercial/lib/commercial.store";
import { useMyConsultants } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";

export default function AgendaPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const {
    selectedAdvisorId,
    setSelectedAdvisorId,
    selectedDate,
    setSelectedDate,
  } = useCommercialFiltersStore();

  const { ROUTE } = AGENDA;
  const permissions = useModulePermissions(ROUTE);

  // Get calendar state from atoms
  const [calendarMonth] = useCalendarMonth();
  const [calendarYear] = useCalendarYear();

  // Ensure selectedDate is initialized to current date if not set
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, [selectedDate, setSelectedDate]);

  // Get current month range based on calendar state
  const { dateFrom, dateTo, currentYear, currentMonth } = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);

    return {
      dateFrom: firstDay.toISOString().split("T")[0],
      dateTo: lastDay.toISOString().split("T")[0],
      currentYear: calendarYear,
      currentMonth: calendarMonth + 1,
    };
  }, [calendarMonth, calendarYear]);

  const { data, isLoading } = useMyAgenda({
    worker_id: selectedAdvisorId,
    date_from: dateFrom,
    date_to: dateTo,
  });

  const agendaData = data || [];

  // Get selected day data
  const selectedDayData = selectedDate
    ? agendaData.find((item) => item.date === selectedDate)
    : undefined;

  // Memoize consultants params to prevent infinite re-renders
  const consultantsParams = useMemo(
    () => ({
      status_id: STATUS_WORKER.ACTIVE,
      sede$empresa_id: EMPRESA_AP.id,
      year: Number(selectedDate ? selectedDate.split("-")[0] : currentYear),
      month: Number(selectedDate ? selectedDate.split("-")[1] : currentMonth),
    }),
    [selectedDate, currentYear, currentMonth]
  );

  const { data: workers = [], isLoading: isLoadingWorkers } =
    useMyConsultants(consultantsParams);

  // Create a map for quick lookup
  const agendaMap = new Map(agendaData.map((item) => [item.date, item]));

  const handleDayClick = (dayData: CalendarDayData) => {
    const dateStr = dayData.date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
  };

  if (isLoadingModule || isLoading || isLoadingWorkers) return <FormSkeleton />;
  if (!checkRouteExists("agenda")) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Mi Agenda Comercial"
          subtitle="Acciones programadas de mis oportunidades"
          icon="Calendar"
        />
        <AgendaActions
          permissions={permissions}
          selectedAdvisorId={selectedAdvisorId}
          setSelectedAdvisorId={setSelectedAdvisorId}
          workers={workers}
        />
      </HeaderTableWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgendaCalendarCard
          agendaMap={agendaMap}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
        <AgendaDayDetails selectedDayData={selectedDayData} />
      </div>
    </PageWrapper>
  );
}
