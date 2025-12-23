"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from 'react-router-dom';
import { AGENDA } from "../../agenda/lib/agenda.constants";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

interface Props {
  canViewAllUsers: boolean;
  workers: WorkerResource[];
  selectedAdvisorId: number | undefined;
  setSelectedAdvisorId: (id: number | undefined) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

export default function OpportunityActions({
  canViewAllUsers,
  workers,
  selectedAdvisorId,
  setSelectedAdvisorId,
  selectedDate,
  setSelectedDate,
}: Props) {
  const push = useNavigate();
  const { ABSOLUTE_ROUTE } = AGENDA;

  const handleAgenda = () => {
    push(ABSOLUTE_ROUTE!);
  };

  // Extract year and month from selectedDate
  const currentYear = selectedDate ? Number(selectedDate.split("-")[0]) : new Date().getFullYear();
  const currentMonth = selectedDate ? Number(selectedDate.split("-")[1]) : new Date().getMonth() + 1;

  const handleYearChange = (year: string) => {
    const month = currentMonth.toString().padStart(2, "0");
    setSelectedDate(`${year}-${month}-01`);
  };

  const handleMonthChange = (month: string) => {
    const monthPadded = month.padStart(2, "0");
    setSelectedDate(`${currentYear}-${monthPadded}-01`);
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
        value={currentMonth.toString()}
        onChange={handleMonthChange}
        placeholder="Mes"
        className="w-32"
      />

      <SearchableSelect
        options={yearOptions}
        value={currentYear.toString()}
        onChange={handleYearChange}
        placeholder="Año"
        className="w-24"
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
