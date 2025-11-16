"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useState } from "react";
import TitleComponent from "@/src/shared/components/TitleComponent";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import type { CalendarDayData } from "@/src/shared/components/CalendarGrid";
import { useMyAgenda } from "@/src/features/ap/comercial/oportunidades/lib/opportunities.hook";
import AgendaActions from "@/src/features/ap/comercial/agenda/components/AgendaActions";
import AgendaCalendarCard from "@/src/features/ap/comercial/agenda/components/AgendaCalendarCard";
import AgendaDayDetails from "@/src/features/ap/comercial/agenda/components/AgendaDayDetails";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { useCommercialFiltersStore } from "@/src/features/ap/comercial/lib/commercial.store";
import { useAllWorkers } from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/src/core/core.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";
import { AGENDA } from "@/src/features/ap/comercial/agenda/lib/agenda.constants";

export default function AgendaPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { selectedAdvisorId, setSelectedAdvisorId } =
    useCommercialFiltersStore();
  const { ROUTE } = AGENDA;
  const permissions = useModulePermissions(ROUTE);

  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers({
    cargo_id: POSITION_TYPE.CONSULTANT,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

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
