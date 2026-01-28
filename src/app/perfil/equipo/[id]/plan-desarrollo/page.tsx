"use client";

import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DevelopmentPlanList from "../../../../../features/gp/gestionhumana/plan-desarrollo/components/DevelopmentPlanList";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { useWorkerById } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";

export default function PlanDesarrolloPage() {
  const { id } = useParams();
  const router = useNavigate();
  const personId = Number(id);

  // Obtener usuario autenticado para verificar si es líder
  const user = useAuthStore((state) => state.user);
  const isLeader = user?.subordinates > 0;

  // Obtener información de la persona
  const { data: workerData } = useWorkerById(personId);
  const personName = workerData?.name || "Colaborador";

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Planes de Desarrollo"
        subtitle={`Gestiona y supervisa los planes de desarrollo de ${personName}`}
        icon="Target"
        backRoute={`/perfil/equipo/${personId}/historial`}
      >
        {isLeader && (
          <Button
            size="sm"
            onClick={() =>
              router(`/perfil/equipo/${personId}/plan-desarrollo/crear`)
            }
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Plan
          </Button>
        )}
      </TitleComponent>

      <DevelopmentPlanList personId={personId} />
    </PageWrapper>
  );
}
