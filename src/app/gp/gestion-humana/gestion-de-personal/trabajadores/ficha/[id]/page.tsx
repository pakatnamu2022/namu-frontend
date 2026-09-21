"use client";

import { useParams } from "react-router-dom";
import { CalendarDays, FileText } from "lucide-react";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import ProfileView from "@/shared/components/ProfileView";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant";
import { useWorkerComplete } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import WorkerVacationsTab from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerVacationsTab";
import WorkerContractsTab from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerContractsTab";

const { ROUTE, ABSOLUTE_ROUTE } = WORKER;

export default function WorkerDetailPage() {
  const { id } = useParams();
  const workerId = Number(id);
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { canManage } = useModulePermissions(ROUTE);
  const { data: worker, isLoading, isError } = useWorkerComplete(workerId);

  if (isLoadingModule || isLoading) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isError || !worker) {
    return (
      <FormWrapper>
        <TitleComponent
          title="Ficha del trabajador"
          icon="User"
          backRoute={ABSOLUTE_ROUTE}
        />
        <p className="py-10 text-center text-sm text-muted-foreground">
          No se pudo cargar la información del trabajador.
        </p>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleComponent
        title={worker.name}
        subtitle="Ficha del trabajador"
        icon="User"
        backRoute={ABSOLUTE_ROUTE}
      />
      <ProfileView
        data={worker}
        extraTabs={[
          {
            id: "vacaciones",
            label: "Vacaciones",
            icon: CalendarDays,
            content: <WorkerVacationsTab workerId={workerId} />,
          },
          {
            id: "contratos",
            label: "Contratos",
            icon: FileText,
            // Los aumentos solo se registran desde Gestión Humana con el permiso "Gestionar".
            content: (
              <WorkerContractsTab
                workerId={workerId}
                canRegisterIncrease={canManage}
              />
            ),
          },
        ]}
      />
    </FormWrapper>
  );
}
