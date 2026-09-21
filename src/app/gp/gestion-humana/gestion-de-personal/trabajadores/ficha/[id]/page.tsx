"use client";

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/shared/components/PageWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import ProfileView from "@/shared/components/ProfileView";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant";
import { useWorkerComplete } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import WorkerVacationsTab from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerVacationsTab";
import WorkerContractsTab from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/components/WorkerContractsTab";

const { ROUTE, ABSOLUTE_ROUTE } = WORKER;

export default function WorkerDetailPage() {
  const { id } = useParams();
  const router = useNavigate();
  const workerId = Number(id);
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { data: worker, isLoading, isError } = useWorkerComplete(workerId);

  if (isLoadingModule || isLoading) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isError || !worker) {
    return (
      <PageWrapper>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => router(ABSOLUTE_ROUTE!)}
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <p className="py-10 text-center text-sm text-muted-foreground">
          No se pudo cargar la información del trabajador.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => router(ABSOLUTE_ROUTE!)}
      >
        <ArrowLeft className="size-4" />
        Volver a trabajadores
      </Button>
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
            content: <WorkerContractsTab workerId={workerId} />,
          },
        ]}
      />
    </PageWrapper>
  );
}
