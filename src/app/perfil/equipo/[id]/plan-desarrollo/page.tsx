"use client";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DevelopmentPlanList from "../../../../../features/gp/gestionhumana/plan-desarrollo/components/DevelopmentPlanList";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useMemo } from "react";

export default function PlanDesarrolloPage() {
  const { id } = useParams();
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const personId = Number(id);

  // Obtener usuario autenticado para verificar si es líder
  const user = useAuthStore((state) => state.user);
  const isLeader = user?.subordinates > 0;

  // Obtener información de la persona
  const { data: workerData } = useWorkers({ person_id: personId });
  const personName = workerData?.data?.[0]?.name || "Colaborador";

  const backRoute = useMemo(() => {
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const per_page = searchParams.get("per_page") || "";

    const params = new URLSearchParams();
    if (page !== "1") params.set("page", page);
    if (search) params.set("search", search);
    if (per_page) params.set("per_page", per_page);

    const queryString = params.toString();
    return `/perfil/equipo/${personId}/historial${
      queryString ? `?${queryString}` : ""
    }`;
  }, [searchParams, personId]);

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Planes de Desarrollo"
        subtitle={`Gestiona y supervisa los planes de desarrollo de ${personName}`}
        icon="Target"
        backRoute={backRoute}
      >
        {isLeader && (
          <Button
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
