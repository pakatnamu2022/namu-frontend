"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import type { CalendarDayData } from "@/shared/components/CalendarGrid";
import { useMyAgenda } from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import AgendaActions from "@/features/ap/comercial/agenda/components/AgendaActions";
import AgendaCalendarCard from "@/features/ap/comercial/agenda/components/AgendaCalendarCard";
import AgendaDayDetails from "@/features/ap/comercial/agenda/components/AgendaDayDetails";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useCommercialFiltersStore } from "@/features/ap/comercial/lib/commercial.store";
import {
  useMyConsultants,
} from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AgendaPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { selectedAdvisorId, setSelectedAdvisorId } =
    useCommercialFiltersStore();
  const { ROUTE } = AGENDA;
  const permissions = useModulePermissions(ROUTE);

  // Get current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const dateFrom = firstDay.toISOString().split("T")[0];
  const dateTo = lastDay.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split("T")[0]
  );

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

  const { data: workers = [], isLoading: isLoadingWorkers } = useMyConsultants({
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
    year: selectedDate ? selectedDate.split("-")[0] : now.getFullYear(),
    month: selectedDate ? selectedDate.split("-")[1] : now.getMonth() + 1,
  });

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
    <div className="space-y-4">
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
    </div>
  );
}
