"use client";

import { useNavigate, useParams } from "react-router-dom";
import DevelopmentPlanForm from "../../../../../../features/gp/gestionhumana/plan-desarrollo/components/DevelopmentPlanForm";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useWorkerById } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";

export default function CrearPlanDesarrolloPage() {
  const { id } = useParams();
  const router = useNavigate();
  const personId = Number(id);
  const currentUser = useAuthStore((state) => state.user);
  const bossId = currentUser?.partner_id;

  // Obtener información de la persona
  const { data: workerData } = useWorkerById(personId);
  const personName = workerData?.name || "Colaborador";

  const handleSuccess = () => {
    // Al guardar exitosamente, redirigir a la lista
    router(`/perfil/equipo/${personId}/plan-desarrollo`);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Plan de Desarrollo - ${personName}`}
        mode="create"
        icon="Target"
        backRoute={`/perfil/equipo/${personId}/plan-desarrollo`}
      />

      <DevelopmentPlanForm
        personId={personId}
        bossId={bossId}
        onSuccess={handleSuccess}
      />
    </FormWrapper>
  );
}
