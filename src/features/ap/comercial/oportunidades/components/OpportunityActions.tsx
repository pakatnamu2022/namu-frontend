"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from 'react-router-dom';
import { AGENDA } from "../../agenda/lib/agenda.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { useCalendarMonth, useCalendarYear, type CalendarState } from "@/shared/components/CalendarGrid";

interface Props {
  canViewAllUsers: boolean;
  workers: WorkerResource[];
  selectedAdvisorId: number | undefined;
  setSelectedAdvisorId: (id: number | undefined) => void;
}

export default function OpportunityActions({
  canViewAllUsers,
  workers,
  selectedAdvisorId,
  setSelectedAdvisorId,
}: Props) {
  const push = useNavigate();
  const { ABSOLUTE_ROUTE } = AGENDA;

  // Use calendar atoms instead of selectedDate
  const [calendarMonth, setCalendarMonth] = useCalendarMonth();
  const [calendarYear, setCalendarYear] = useCalendarYear();

  const handleAgenda = () => {
    push(ABSOLUTE_ROUTE!);
  };

  const handleYearChange = (year: string) => {
    setCalendarYear(Number(year));
  };

  const handleMonthChange = (month: string) => {
    setCalendarMonth((Number(month) - 1) as CalendarState["month"]);
  };

  // Generate years (2020-2030) and months
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    value: (2020 + i).toString(),
    label: (2020 + i).toString(),
  }));

  const monthOptions = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  return (
    <ActionsWrapper>
      <SearchableSelect
        options={monthOptions}
        value={(calendarMonth + 1).toString()}
        onChange={handleMonthChange}
        placeholder="Mes"
        className="w-32"
        allowClear={false}
      />

      <SearchableSelect
        options={yearOptions}
        value={calendarYear.toString()}
        onChange={handleYearChange}
        placeholder="Año"
        className="w-24"
        allowClear={false}
      />

      {canViewAllUsers && (
        <SearchableSelect
          options={workers.map((worker) => ({
            value: worker.id.toString(),
            label: worker.name,
          }))}
          value={selectedAdvisorId?.toString() || ""}
          onChange={(value: string) =>
            setSelectedAdvisorId(value ? Number(value) : undefined)
          }
          className="min-w-72"
          placeholder="Filtrar por asesor..."
        />
      )}

      <Button size="sm" className="" onClick={handleAgenda}>
        <Calendar className="size-4 mr-2" /> Ver Agenda
      </Button>
    </ActionsWrapper>
  );
}
