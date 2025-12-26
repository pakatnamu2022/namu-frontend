"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-mobile";
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
import { useGetWorkOrder } from "../../orden-trabajo/lib/workOrder.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useCreateWorkOrderPlanning } from "../lib/workOrderPlanning.hook";
import { toast } from "sonner";
import {
  exceptionalCaseSchema,
  ExceptionalCaseFormValues,
} from "../lib/workOrderPlanning.schema";
import {
  Loader,
  Check,
  ChevronsUpDown,
  Loader2,
  Package,
  ListChecks,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { FormInput } from "@/shared/components/FormInput";

interface ExceptionalCaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sedeId?: string;
}

export function ExceptionalCaseSheet({
  open,
  onOpenChange,
  sedeId,
}: ExceptionalCaseSheetProps) {
  const isTablet = useIsTablet();
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [openWorkOrderSelect, setOpenWorkOrderSelect] = useState(false);
  const [searchWorkOrder, setSearchWorkOrder] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageWorkOrder, setPageWorkOrder] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const form = useForm<ExceptionalCaseFormValues>({
    resolver: zodResolver(exceptionalCaseSchema),
    defaultValues: {
      work_order_id: "",
      worker_id: "",
      description: "",
      estimated_hours: "",
      planned_start_datetime: "",
      group_number: 1,
    },
    mode: "onChange",
  });

  // Obtener órdenes de trabajo con búsqueda
  const { data: workOrdersData, isLoading: isLoadingWorkOrders } =
    useGetWorkOrder({
      params: {
        search: debouncedSearch,
        page: pageWorkOrder,
        per_page: 20,
      },
    });

  const workOrders = useMemo(
    () => workOrdersData?.data || [],
    [workOrdersData?.data]
  );

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearch !== searchWorkOrder) {
        setDebouncedSearch(searchWorkOrder);
        setPageWorkOrder(1);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchWorkOrder, debouncedSearch]);

  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    ...(sedeId
      ? { sede_id: Number(sedeId) }
      : { sede$empresa_id: EMPRESA_AP.id }),
  });

  const createPlanningMutation = useCreateWorkOrderPlanning();

  // Obtener la orden de trabajo seleccionada
  const selectedWorkOrder = useMemo(() => {
    if (!selectedWorkOrderId) return null;
    return workOrders.find((wo) => wo.id.toString() === selectedWorkOrderId);
  }, [selectedWorkOrderId, workOrders]);

  // Obtener los grupos únicos de los items
  const availableGroups = useMemo(() => {
    if (!selectedWorkOrder?.items) return [];
    const groups = new Set(
      selectedWorkOrder.items.map((item) => item.group_number)
    );
    return Array.from(groups).sort();
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
      (item) => item.group_number === activeGroup
    );
  }, [selectedWorkOrder, activeGroup]);

  // Actualizar el valor de group_number en el formulario cuando cambie activeGroup
  useEffect(() => {
    if (activeGroup !== null) {
      form.setValue("group_number", activeGroup);
    }
  }, [activeGroup, form]);

  const handleClose = () => {
    form.reset();
    setSelectedWorkOrderId("");
    setSelectedGroup(null);
    setSelectedItemId(null);
    setSearchWorkOrder("");
    onOpenChange(false);
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);

    // Obtener la descripción del item seleccionado
    const selectedItem = filteredItems.find((item) => item.id === itemId);
    if (selectedItem) {
      form.setValue("description", selectedItem.description);
    } else {
      form.setValue("description", "");
    }
  };

  // Validar horario permitido
  const validateWorkingHours = (datetime: string): boolean => {
    if (!datetime) return false;

    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Horario de trabajo: 8:00 AM (480 min) a 6:00 PM (1080 min)
    // Almuerzo: 1:00 PM (780 min) a 2:24 PM (864 min)
    const MORNING_START = 480; // 8:00
    const LUNCH_START = 780; // 13:00
    const LUNCH_END = 864; // 14:24
    const AFTERNOON_END = 1080; // 18:00

    // Verificar que esté dentro del horario laboral
    if (totalMinutes < MORNING_START || totalMinutes > AFTERNOON_END) {
      return false;
    }

    // Verificar que no esté en horario de almuerzo
    if (totalMinutes >= LUNCH_START && totalMinutes < LUNCH_END) {
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (data: ExceptionalCaseFormValues) => {
    // Validar horario permitido
    if (!validateWorkingHours(data.planned_start_datetime)) {
      toast.error(
        "El horario seleccionado no está permitido. El horario de trabajo es de 8:00 AM a 6:00 PM, excluyendo el almuerzo (1:00 PM - 2:24 PM)."
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
        type: "external", // Marcador para casos excepcionales
      });

      toast.success("Planificación excepcional creada correctamente");

      // Limpiar formulario y cerrar
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Error al crear la planificación excepcional"
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
      className="sm:max-w-3xl"
      icon="AlertTriangle"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Orden de Trabajo con búsqueda */}
          <FormField
            control={form.control}
            name="work_order_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de Trabajo</FormLabel>
                <Popover
                  open={openWorkOrderSelect}
                  onOpenChange={setOpenWorkOrderSelect}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openWorkOrderSelect}
                        className="w-full justify-between font-medium"
                      >
                        {selectedWorkOrderId ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              #{selectedWorkOrder?.correlative}
                            </Badge>
                            <span className="text-sm">
                              {selectedWorkOrder?.vehicle_plate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Buscar OT...
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar por correlativo o placa..."
                        value={searchWorkOrder}
                        onValueChange={setSearchWorkOrder}
                      />
                      <CommandList>
                        {isLoadingWorkOrders ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : workOrders.length === 0 ? (
                          <CommandEmpty>
                            No se encontraron órdenes de trabajo.
                          </CommandEmpty>
                        ) : (
                          workOrders.map((wo) => (
                            <CommandItem
                              key={wo.id}
                              value={wo.id.toString()}
                              onSelect={() => {
                                setSelectedWorkOrderId(wo.id.toString());
                                field.onChange(wo.id.toString());
                                setSelectedGroup(null);
                                setSelectedItemId(null);
                                form.setValue("description", "");
                                setOpenWorkOrderSelect(false);
                                setSearchWorkOrder("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedWorkOrderId === wo.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  #{wo.correlative}
                                </Badge>
                                <span className="text-sm">
                                  {wo.vehicle_plate}
                                </span>
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
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
                      (item) => item.group_number === group
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
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Seleccionar Descripción de Trabajo
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedItemId === item.id
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => handleItemSelect(item.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-5">
                            <input
                              type="radio"
                              name="item-selection"
                              checked={selectedItemId === item.id}
                              onChange={() => handleItemSelect(item.id)}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50"
                              >
                                {item.type_planning_name}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay items disponibles para este grupo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Campos ocultos para validación */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group_number"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

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

          {/* Fecha y Hora de Inicio con validación */}
          <DateTimePickerForm
            name="planned_start_datetime"
            label="Fecha y Hora de Inicio"
            control={form.control}
            placeholder="Seleccione fecha y hora"
            description="Horario permitido: 8:00 AM - 6:00 PM (excluyendo 1:00 PM - 2:24 PM)"
          />

          {/* Duración */}
          <FormInput
            name="estimated_hours"
            label="Duración del Trabajo (horas)"
            placeholder="Ej: 2.5"
            control={form.control}
            type="text"
            description="Ingrese la duración real del trabajo en horas (puede usar decimales)"
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
