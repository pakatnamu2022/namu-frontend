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
}

export default function OpportunityActions({
  canViewAllUsers,
  workers,
  selectedAdvisorId,
  setSelectedAdvisorId,
}: Props) {
  const push = useNavigate();
  const { ABSOLUTE_ROUTE } = AGENDA;

  const handleAgenda = () => {
    push(ABSOLUTE_ROUTE!);
  };
  return (
    <ActionsWrapper>
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
