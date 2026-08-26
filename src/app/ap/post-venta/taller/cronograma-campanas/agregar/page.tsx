"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import MultiDateSelectorCard from "@/shared/components/MultiDateSelectorCard";
import { notFound } from "@/shared/hooks/useNotFound";
import { errorToast, successToast } from "@/core/core.function";
import { EMPRESA_AP } from "@/core/core.constants";
import { CAMPAIGN_SCHEDULE } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.constants";
import { useWorkerSchedule } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.hook";
import { storeCampaignSchedule } from "@/features/ap/post-venta/taller/cronograma-campanas/lib/campaignSchedule.actions";
import CampaignScheduleFilters from "@/features/ap/post-venta/taller/cronograma-campanas/components/CampaignScheduleFilters";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";

export default function AddCampaignSchedulePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { user } = useAuthStore();
  const { ROUTE, ABSOLUTE_ROUTE } = CAMPAIGN_SCHEDULE;

  const [sedeId, setSedeId] = useState<string>("");
  const [workerId, setWorkerId] = useState<string>("");
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: mySedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { data: tecnicos = [], isLoading: isLoadingTecnicos } = useAllWorkers(
    {
      cargo_id: POSITION_TYPE.OPERATORS,
      status_id: STATUS_WORKER.ACTIVE,
      sede_id: sedeId || undefined,
      sede$empresa_id: EMPRESA_AP.id,
    },
    !!sedeId,
  );

  const matchedWorker = tecnicos.find((t) => t.id === user?.partner_id);
  const isWorkerLocked = !!matchedWorker;

  useEffect(() => {
    if (isWorkerLocked && matchedWorker) {
      setWorkerId(matchedWorker.id.toString());
    }
  }, [isWorkerLocked, matchedWorker]);

  useEffect(() => {
    if (mySedes.length > 0 && !sedeId) {
      setSedeId(mySedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySedes]);

  useEffect(() => {
    if (!isWorkerLocked) {
      setWorkerId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeId]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const {
    data: workerSchedule,
    isLoading: isLoadingSchedule,
    refetch,
  } = useWorkerSchedule(
    {
      worker_id: workerId,
      start_date: format(monthStart, "yyyy-MM-dd"),
      end_date: format(monthEnd, "yyyy-MM-dd"),
    },
    !!workerId,
  );

  useEffect(() => {
    if (!workerSchedule) return;
    setSelectedDates(
      workerSchedule.dates.map((d) => {
        const [year, m, day] = d.date.split("-").map(Number);
        return new Date(year, m - 1, day);
      }),
    );
  }, [workerSchedule]);

  const handleSave = async () => {
    if (!sedeId || !workerId) return;
    setIsSaving(true);
    try {
      const dates = selectedDates.map((d) => format(d, "yyyy-MM-dd")).sort();
      const response = await storeCampaignSchedule({
        sede_id: Number(sedeId),
        worker_id: Number(workerId),
        dates,
      });
      successToast(response.message || "Cronograma actualizado correctamente.");
      await refetch();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Error al guardar el cronograma de campaña.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingModule || isLoadingSedes) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        subtitle="Selecciona la sede y el técnico para gestionar su cronograma de campaña"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />

      <CampaignScheduleFilters
        sedes={mySedes}
        sedeId={sedeId}
        setSedeId={setSedeId}
        trabajadores={tecnicos}
        workerId={workerId}
        setWorkerId={setWorkerId}
        isWorkerLocked={isWorkerLocked}
        isLoadingTrabajadores={isLoadingTecnicos}
      />

      <MultiDateSelectorCard
        title="Cronograma de campaña"
        description="Selecciona las fechas en las que el técnico participará en campañas durante"
        emptyMessage="Selecciona una sede y un técnico para ver y editar su cronograma de campaña."
        month={month}
        onMonthChange={setMonth}
        selectedDates={selectedDates}
        onSelectDates={setSelectedDates}
        onSave={handleSave}
        isLoading={isLoadingSchedule}
        isSaving={isSaving}
        disabled={!workerId}
        saveLabel="Guardar cronograma"
      />
    </FormWrapper>
  );
}
