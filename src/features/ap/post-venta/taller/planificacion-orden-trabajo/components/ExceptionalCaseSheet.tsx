"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useGetWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useCreateWorkOrderPlanning } from "../lib/workOrderPlanning.hook";
import {
  exceptionalCaseSchema,
  ExceptionalCaseFormValues,
} from "../lib/workOrderPlanning.schema";
import { WORK_SCHEDULE } from "../lib/workOrderPlanning.constants";
import { Loader, Package, ListChecks } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { errorToast, successToast } from "@/core/core.function";
import { useIsTablet } from "@/hooks/use-tablet";
import { FormInput } from "@/shared/components/FormInput";
import { STATUS_WORK_ORDER } from "../../orden-trabajo/lib/workOrder.constants";

interface ExceptionalCaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sedeId?: string;
}

function useWorkOrderAsync(params: {
  search?: string;
  page?: number;
  per_page?: number;
  sede_id?: string;
  [key: string]: any;
}) {
  return useGetWorkOrder({
    params: {
      search: params.search,
      page: params.page,
      per_page: params.per_page,
      status_id: [
        STATUS_WORK_ORDER.APERTURADO,
        STATUS_WORK_ORDER.RECEPCIONADO,
        STATUS_WORK_ORDER.EN_TRABAJO,
      ],
      sede_id: params.sede_id,
    },
  });
}

export function ExceptionalCaseSheet({
  open,
  onOpenChange,
  sedeId,
}: ExceptionalCaseSheetProps) {
  const isTablet = useIsTablet();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const form = useForm<ExceptionalCaseFormValues>({
    resolver: zodResolver(exceptionalCaseSchema),
    defaultValues: {
      work_order_id: "",
      worker_id: "",
      description: "",
      estimated_hours: "",
      planned_start_datetime: "",
      planned_end_datetime: "",
      group_number: 1,
    },
    mode: "onChange",
  });

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    ...(sedeId
      ? { sede_id: Number(sedeId) }
      : { sede$empresa_id: EMPRESA_AP.id }),
  });

  const createPlanningMutation = useCreateWorkOrderPlanning();

  // Obtener los grupos únicos de los items
  const availableGroups = useMemo(() => {
    if (!selectedWorkOrder?.items) return [];
    const groups = new Set(
      selectedWorkOrder.items.map((item: any) => item.group_number),
    );
    return Array.from(groups).sort() as number[];
  }, [selectedWorkOrder]);

  // Auto-seleccionar grupo si solo hay uno
  const activeGroup = useMemo(() => {
    if (availableGroups.length === 1) return availableGroups[0];
    return selectedGroup;
  }, [availableGroups, selectedGroup]);

  // Filtrar items por grupo seleccionado
  const filteredItems = useMemo(() => {
    if (!selectedWorkOrder?.items) return [];
    if (activeGroup === null) return selectedWorkOrder.items;
    return selectedWorkOrder.items.filter(
      (item: any) => item.group_number === activeGroup,
    );
  }, [selectedWorkOrder, activeGroup]);

  // Actualizar el valor de group_number en el formulario cuando cambie activeGroup
  useEffect(() => {
    if (activeGroup !== null) {
      form.setValue("group_number", activeGroup);
    }
  }, [activeGroup, form]);

  // Auto-seleccionar item si solo hay uno en el grupo activo
  useEffect(() => {
    if (filteredItems.length === 1) {
      setSelectedItemId(filteredItems[0].id);
      form.setValue("description", filteredItems[0].description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems]);

  // Calcula las horas trabajadas excluyendo el almuerzo
  const calculateWorkingHours = (start: string, end: string): number => {
    const { LUNCH_START, LUNCH_END } = WORK_SCHEDULE;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    let totalMinutes = endMinutes - startMinutes;

    const lunchOverlapStart = Math.max(startMinutes, LUNCH_START);
    const lunchOverlapEnd = Math.min(endMinutes, LUNCH_END);
    if (lunchOverlapEnd > lunchOverlapStart) {
      totalMinutes -= lunchOverlapEnd - lunchOverlapStart;
    }

    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  const watchStart = form.watch("planned_start_datetime");
  const watchEnd = form.watch("planned_end_datetime");

  useEffect(() => {
    if (watchStart && watchEnd) {
      const hours = calculateWorkingHours(watchStart, watchEnd);
      if (hours > 0) {
        form.setValue("estimated_hours", String(hours));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchStart, watchEnd]);

  const handleClose = () => {
    form.reset();
    setSelectedWorkOrder(null);
    setSelectedGroup(null);
    setSelectedItemId(null);
    onOpenChange(false);
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
    const item = filteredItems.find((i: any) => i.id === itemId);
    form.setValue("description", item ? item.description : "");
  };

  const validateWorkingHours = (datetime: string): boolean => {
    if (!datetime) return false;
    const date = new Date(datetime);
    const totalMinutes = date.getHours() * 60 + date.getMinutes();
    const { MORNING_START, LUNCH_START, LUNCH_END, AFTERNOON_END } =
      WORK_SCHEDULE;
    if (totalMinutes < MORNING_START || totalMinutes > AFTERNOON_END)
      return false;
    if (totalMinutes >= LUNCH_START && totalMinutes < LUNCH_END) return false;
    return true;
  };

  const handleFormSubmit = async (data: ExceptionalCaseFormValues) => {
    if (!validateWorkingHours(data.planned_start_datetime)) {
      errorToast(
        "La hora de inicio no está permitida. El horario de trabajo es de 8:00 AM a 6:00 PM, excluyendo el almuerzo (1:00 PM - 2:24 PM).",
      );
      return;
    }
    if (!validateWorkingHours(data.planned_end_datetime)) {
      errorToast(
        "La hora de fin no está permitida. El horario de trabajo es de 8:00 AM a 6:00 PM, excluyendo el almuerzo (1:00 PM - 2:24 PM).",
      );
      return;
    }
    try {
      await createPlanningMutation.mutateAsync({
        work_order_id: Number(data.work_order_id),
        worker_id: Number(data.worker_id),
        description: data.description,
        estimated_hours: Number(data.estimated_hours),
        planned_start_datetime: data.planned_start_datetime,
        group_number: data.group_number,
        type: "external",
      });
      successToast("Planificación excepcional creada correctamente");
      handleClose();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al crear la planificación excepcional",
      );
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Caso Excepcional"
      subtitle="Registre una planificación fuera del horario normal o para casos especiales donde el trabajador terminó antes de lo planificado."
      type={isTablet ? "tablet" : "default"}
      className="3xl"
      icon="AlertTriangle"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Orden de Trabajo con búsqueda */}
          <FormSelectAsync
            name="work_order_id"
            label="Orden de Trabajo"
            placeholder="Buscar OT por correlativo o placa..."
            control={form.control}
            useQueryHook={useWorkOrderAsync}
            mapOptionFn={(wo) => ({
              value: wo.id.toString(),
              label: `#${wo.correlative} — ${wo.vehicle_plate || wo.vehicle_vin || "Sin placa"}`,
            })}
            onValueChange={(_value, item) => {
              setSelectedWorkOrder(item ?? null);
              setSelectedGroup(null);
              setSelectedItemId(null);
              form.setValue("description", "");
            }}
            additionalParams={sedeId ? { sede_id: sedeId } : {}}
          />

          {/* Selector de Grupo si hay más de uno */}
          {selectedWorkOrder && availableGroups.length > 1 && (
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Seleccionar Grupo
              </Label>
              <RadioGroup
                value={selectedGroup?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedGroup(Number(value));
                  setSelectedItemId(null);
                  form.setValue("description", "");
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {availableGroups.map((group) => {
                    const itemCount = selectedWorkOrder.items.filter(
                      (item: any) => item.group_number === group,
                    ).length;
                    return (
                      <div key={group} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={group.toString()}
                          id={`group-${group}`}
                        />
                        <Label
                          htmlFor={`group-${group}`}
                          className="cursor-pointer font-medium text-sm"
                        >
                          Grupo {group}{" "}
                          <span className="text-muted-foreground">
                            ({itemCount} trabajos)
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Lista de Descripciones */}
          {selectedWorkOrder && activeGroup !== null && (
            <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" />
                Seleccionar Descripción de Trabajo
              </Label>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item: any) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 px-2 py-3 rounded border cursor-pointer transition-colors ${
                        selectedItemId === item.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                      onClick={() => handleItemSelect(item.id)}
                    >
                      <div className="flex items-center h-5 shrink-0 mt-0.5">
                        <input
                          type="radio"
                          name="item-selection"
                          checked={selectedItemId === item.id}
                          onChange={() => handleItemSelect(item.id)}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50 px-1.5 py-0"
                          >
                            {item.type_planning.description}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50 px-1.5 py-0"
                          >
                            {item.type_operation_name}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-800 leading-snug mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No hay items disponibles para este grupo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Campos ocultos para validación */}
          <div className="hidden">
            <FormInput control={form.control} name="description" />
            <FormInput control={form.control} name="group_number" value={1} />
          </div>

          {/* Operario */}
          <FormSelect
            name="worker_id"
            label="Operario"
            placeholder="Seleccione un operario"
            options={workers.map((worker) => ({
              label: worker.name,
              value: worker.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
          />

          {/* Fecha y Hora de Inicio */}
          <DateTimePickerForm
            name="planned_start_datetime"
            label="Fecha y Hora de Inicio"
            control={form.control}
            placeholder="Seleccione fecha y hora"
            description="Horario permitido: 8:00 AM - 6:00 PM (excluyendo 1:00 PM - 2:24 PM)"
          />

          {/* Fecha y Hora de Fin */}
          <DateTimePickerForm
            name="planned_end_datetime"
            label="Fecha y Hora de Fin"
            control={form.control}
            placeholder="Seleccione fecha y hora"
            description="Debe ser el mismo día y dentro del horario permitido"
          />

          {/* Duración calculada (solo lectura) */}
          <FormField
            control={form.control}
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración del Trabajo (horas)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="Se calcula automáticamente"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Calculado automáticamente a partir de las fechas
                  seleccionadas, descontando el tiempo de almuerzo
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPlanningMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createPlanningMutation.isPending || !form.formState.isValid
              }
            >
              <Loader
                className={`mr-2 h-4 w-4 ${
                  !createPlanningMutation.isPending ? "hidden" : ""
                }`}
              />
              {createPlanningMutation.isPending
                ? "Guardando..."
                : "Guardar Planificación"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
