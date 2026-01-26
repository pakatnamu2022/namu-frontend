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
import { WorkScheduleResource } from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.interface";
import { WorkScheduleSchema } from "@/features/gp/gestionhumana/planillas/dia-trabajo/lib/work-schedule.schema";
import {
  useAllPayrollPeriods,
  useCurrentPayrollPeriod,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useAllWorkTypes } from "@/features/gp/gestionhumana/planillas/tipo-dia-trabajo/lib/work-type.hook";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkSchedulesPage() {
  const { MODEL, ROUTE } = WORK_SCHEDULE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  // State
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingSchedule, setEditingSchedule] =
    useState<WorkScheduleResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: periods = [], isLoading: isLoadingPeriods } =
    useAllPayrollPeriods();
  const { data: currentPeriod, isLoading: isLoadingCurrentPeriod } =
    useCurrentPayrollPeriod();
  const { data: workTypes = [], isLoading: isLoadingWorkTypes } =
    useAllWorkTypes();

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

  // Selected worker data
  const selectedWorkerData = useMemo(() => {
    if (!selectedWorkerId || !summaryData) return null;
    return summaryData.summary.find((w) => w.worker_id === selectedWorkerId);
  }, [selectedWorkerId, summaryData]);

  const handleWorkerSelect = (workerId: number) => {
    setSelectedWorkerId(workerId === selectedWorkerId ? null : workerId);
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
    setSelectedDate(new Date(schedule.work_date));
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

  const isLoadingData =
    isLoadingPeriods || isLoadingCurrentPeriod || isLoadingWorkTypes;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!selectedPeriodId}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </HeaderTableWrapper>

      {/* Period Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Seleccionar Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <Skeleton className="h-10 w-full max-w-xs" />
          ) : (
            <Form {...form}>
              <div className="max-w-xs">
                <FormSelect
                  control={form.control}
                  name="period_id"
                  placeholder="Selecciona un período"
                  options={periodOptions}
                  disabled={isLoadingPeriods}
                />
              </div>
            </Form>
          )}
        </CardContent>
      </Card>

      {selectedPeriodId && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Summary Table */}
          <div className="lg:col-span-1">
            <WorkScheduleSummary
              period={summaryData?.period}
              summary={summaryData?.summary || []}
              workersCount={summaryData?.workers_count || 0}
              isLoading={isLoadingSummary}
              selectedWorkerId={selectedWorkerId ?? undefined}
              onWorkerSelect={handleWorkerSelect}
            />
          </div>

          {/* Calendar View */}
          <div className="lg:col-span-2">
            {selectedWorkerId && selectedWorkerData && selectedPeriod ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Calendario -{" "}
                    {format(
                      new Date(selectedPeriod.year, selectedPeriod.month - 1),
                      "MMMM yyyy",
                      { locale: es },
                    )}
                  </h2>
                </div>
                <WorkScheduleCalendar
                  year={selectedPeriod.year}
                  month={selectedPeriod.month}
                  schedules={schedules}
                  workerId={selectedWorkerId}
                  workerName={selectedWorkerData.worker_name}
                  onAddSchedule={handleAddSchedule}
                  onEditSchedule={handleEditSchedule}
                  onDeleteSchedule={setDeleteId}
                  canModify={selectedPeriod.can_modify !== false}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un trabajador de la tabla de resumen</p>
                  <p className="text-sm">para ver y gestionar su calendario</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
            workTypes={workTypes}
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
