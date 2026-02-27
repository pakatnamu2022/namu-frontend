"use client";

import { useState, useMemo, useEffect } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_SCHEDULE } from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.constant";
import {
  useWorkSchedulesByPeriod,
  useWorkScheduleSummary,
} from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.hook";
import {
  storeWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
} from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.actions";
import { WorkScheduleCalendar } from "@/features/gp/gestionhumana/planillas/dia-trabajo/components/WorkScheduleCalendar";
import { WorkScheduleForm } from "@/features/gp/gestionhumana/planillas/dia-trabajo/components/WorkScheduleForm";
import { WorkScheduleSummary } from "@/features/gp/gestionhumana/planillas/dia-trabajo/components/WorkScheduleSummary";
import {
  WorkScheduleResource,
  WorkScheduleWorkerSummary,
} from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.interface";
import { WorkScheduleSchema } from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.schema";
import {
  useAllPayrollPeriods,
  useCurrentPayrollPeriod,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useAttendanceRuleCodes } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ExtraWorker {
  id: number;
  name: string;
}

export default function WorkSchedulesPage() {
  const { MODEL, ROUTE } = WORK_SCHEDULE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  // State
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [extraWorkers, setExtraWorkers] = useState<ExtraWorker[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingSchedule, setEditingSchedule] =
    useState<WorkScheduleResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: periods = [], isLoading: isLoadingPeriods } =
    useAllPayrollPeriods();
  const {
    data: currentPeriod,
    isLoading: isLoadingCurrentPeriod,
    error: currentPeriodError,
    isError: isCurrentPeriodError,
  } = useCurrentPayrollPeriod();
  const { data: codes = [] } = useAttendanceRuleCodes();
  const { data: allWorkers = [], isLoading: isLoadingWorkers } = useAllWorkers();

  // Set default period when current period loads
  useEffect(() => {
    if (currentPeriod && !selectedPeriodId) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod, selectedPeriodId]);

  const { data: schedules = [], refetch: refetchSchedules } =
    useWorkSchedulesByPeriod(selectedPeriodId);

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useWorkScheduleSummary(selectedPeriodId);

  // Form for period selector
  const form = useForm({
    defaultValues: {
      period_id: "",
    },
  });

  // Watch period_id changes
  const watchedPeriodId = form.watch("period_id");
  useEffect(() => {
    if (watchedPeriodId) {
      const periodId = parseInt(watchedPeriodId);
      if (periodId !== selectedPeriodId) {
        setSelectedPeriodId(periodId);
        setSelectedWorkerId(null);
        setExtraWorkers([]);
      }
    }
  }, [watchedPeriodId, selectedPeriodId]);

  // Set form value when current period loads
  useEffect(() => {
    if (currentPeriod && !form.getValues("period_id")) {
      form.setValue("period_id", String(currentPeriod.id));
    }
  }, [currentPeriod, form]);

  // Selected period data
  const selectedPeriod = useMemo(() => {
    return (
      periods.find((p) => p.id === selectedPeriodId) || summaryData?.period
    );
  }, [periods, selectedPeriodId, summaryData]);

  // Period options for select
  const periodOptions = useMemo(() => {
    return periods.map((p) => ({
      value: String(p.id),
      label: p.name,
      description: p.code,
    }));
  }, [periods]);

  // Workers available for the "add worker" dialog (mapped from WorkerResource)
  const availableWorkers = useMemo(() => {
    return allWorkers.map((w) => ({ id: w.id, name: w.name }));
  }, [allWorkers]);

  // Merge summary data with manually added extra workers
  const displaySummary = useMemo((): WorkScheduleWorkerSummary[] => {
    const base = summaryData?.summary ?? [];
    const summaryIds = new Set(base.map((s) => s.worker_id));
    const extras = extraWorkers
      .filter((w) => !summaryIds.has(w.id))
      .map((w): WorkScheduleWorkerSummary => ({
        worker_id: w.id,
        worker_name: w.name,
        salary: 0,
        shift_hours: 0,
        base_hour_value: 0,
        details: [],
        total_amount: 0,
      }));
    return [...base, ...extras];
  }, [summaryData, extraWorkers]);

  // Selected worker data (from summary or extra workers)
  const selectedWorkerData = useMemo((): WorkScheduleWorkerSummary | null => {
    if (!selectedWorkerId) return null;
    const fromSummary = displaySummary.find(
      (w) => w.worker_id === selectedWorkerId,
    );
    return fromSummary ?? null;
  }, [selectedWorkerId, displaySummary]);

  const handleWorkerSelect = (workerId: number) => {
    setSelectedWorkerId(workerId === selectedWorkerId ? null : workerId);
  };

  const handleAddWorker = (workerId: number, workerName: string) => {
    setExtraWorkers((prev) => {
      if (prev.some((w) => w.id === workerId)) return prev;
      return [...prev, { id: workerId, name: workerName }];
    });
    setSelectedWorkerId(workerId);
  };

  const handleAddSchedule = (date: Date) => {
    if (!selectedWorkerId) {
      errorToast("Selecciona un trabajador primero");
      return;
    }
    setSelectedDate(date);
    setEditingSchedule(null);
    setFormOpen(true);
  };

  const handleEditSchedule = (schedule: WorkScheduleResource) => {
    setSelectedDate(new Date(schedule.work_date + "T00:00:00"));
    setEditingSchedule(schedule);
    setFormOpen(true);
  };

  const handleSubmit = async (data: WorkScheduleSchema) => {
    if (!selectedPeriodId) return;

    setIsSubmitting(true);
    try {
      if (editingSchedule) {
        await updateWorkSchedule(String(editingSchedule.id), data);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      } else {
        await storeWorkSchedule({
          ...data,
          period_id: selectedPeriodId,
        });
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      }
      await Promise.all([refetchSchedules(), refetchSummary()]);
      setFormOpen(false);
      setEditingSchedule(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          ERROR_MESSAGE(MODEL, editingSchedule ? "update" : "create"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorkSchedule(deleteId);
      await Promise.all([refetchSchedules(), refetchSummary()]);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleRefresh = () => {
    refetchSchedules();
    refetchSummary();
  };

  // Loading states
  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  const isLoadingData = isLoadingPeriods || isLoadingCurrentPeriod;

  return (
    <div className="space-y-3">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2">
          {isLoadingData ? (
            <Skeleton className="h-9 w-52" />
          ) : (
            <div className="flex flex-col gap-0.5">
              <Form {...form}>
                <FormSelect
                  control={form.control}
                  name="period_id"
                  placeholder="Selecciona un período"
                  options={periodOptions}
                  disabled={isLoadingPeriods}
                />
              </Form>
              {isCurrentPeriodError && (
                <p className="text-xs text-destructive">
                  {(currentPeriodError as any)?.response?.data?.message ??
                    "No se pudo cargar el período actual"}
                </p>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!selectedPeriodId}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Actualizar
          </Button>
        </div>
      </HeaderTableWrapper>

      {selectedPeriodId ? (
        <div className="grid gap-3 lg:grid-cols-7 items-start">
          {/* Lista de trabajadores — 1 columna, alto del calendario */}
          <div className="lg:col-span-2 lg:sticky lg:top-4 self-start">
            <WorkScheduleSummary
              period={summaryData?.period}
              summary={displaySummary}
              workersCount={displaySummary.length}
              isLoading={isLoadingSummary}
              selectedWorkerId={selectedWorkerId ?? undefined}
              onWorkerSelect={handleWorkerSelect}
              availableWorkers={availableWorkers}
              isLoadingWorkers={isLoadingWorkers}
              onAddWorker={handleAddWorker}
            />
          </div>

          {/* Calendario — 4 columnas */}
          <div className="lg:col-span-5">
            {selectedWorkerId && selectedWorkerData && selectedPeriod ? (
              <WorkScheduleCalendar
                year={selectedPeriod.year}
                month={selectedPeriod.month}
                schedules={schedules}
                workerId={selectedWorkerId}
                workerName={`${selectedWorkerData.worker_name} — ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), "MMMM yyyy", { locale: es })}`}
                onAddSchedule={handleAddSchedule}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={setDeleteId}
                canModify={selectedPeriod.can_modify !== false}
              />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarDays />
                  </EmptyMedia>
                  <EmptyTitle>Sin trabajador seleccionado</EmptyTitle>
                  <EmptyDescription>
                    Selecciona un trabajador de la lista para ver su calendario
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>Selecciona un período</EmptyTitle>
            <EmptyDescription>
              Elige un período de planilla en el selector de arriba
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Form Modal */}
      {formOpen &&
        selectedWorkerId &&
        selectedWorkerData &&
        selectedPeriodId && (
          <WorkScheduleForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            codes={codes}
            periodId={selectedPeriodId}
            workerId={selectedWorkerId}
            workerName={selectedWorkerData.worker_name}
            selectedDate={selectedDate}
            editingSchedule={editingSchedule}
          />
        )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
