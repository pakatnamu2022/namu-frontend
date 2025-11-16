"use client";

import { Button } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useRouter } from "next/navigation";
import { OPPORTUNITIES } from "../../oportunidades/lib/opportunities.constants";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";
import { WorkerResource } from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";

interface Props {
  permissions: {
    canViewAdvisors: boolean;
  };
  workers: WorkerResource[];
  selectedAdvisorId: number | undefined;
  setSelectedAdvisorId: (id: number | undefined) => void;
}

export default function AgendaActions({
  permissions,
  workers,
  selectedAdvisorId,
  setSelectedAdvisorId,
}: Props) {
  const { push } = useRouter();
  const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

  const handleOpportunities = () => {
    push(ABSOLUTE_ROUTE!);
  };
  return (
    <ActionsWrapper>
      {permissions.canViewAdvisors && (
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
      <Button size="sm" onClick={handleOpportunities}>
        <BriefcaseBusiness className="size-4 mr-2" /> Ver Oportunidades
      </Button>
    </ActionsWrapper>
  );
}
