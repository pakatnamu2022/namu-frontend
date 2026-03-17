import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useMemo } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Loader,
  FileText,
  Car,
  Building,
  Plus,
  List,
  Search,
  ClipboardCheck,
  Calendar,
  Gauge,
  FileCheck,
  User,
} from "lucide-react";
import {
  WorkOrderSchema,
  workOrderSchemaCreate,
  workOrderSchemaUpdate,
} from "../lib/workOrder.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EMPRESA_AP } from "@/core/core.constants";
import { AppointmentPlanningResource } from "../../citas/lib/appointmentPlanning.interface";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
  WorkOrderResource,
} from "../lib/workOrder.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { AppointmentSelectionModal } from "../../citas/components/AppointmentSelectionModal";
import { VehicleInspectionSelectionModal } from "../../inspeccion-vehiculo/components/VehicleInspectionSelectionModal";
import { VehicleInspectionResource } from "../../inspeccion-vehiculo/lib/vehicleInspection.interface";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormInput } from "@/shared/components/FormInput";
import { FormInputText } from "@/shared/components/FormInputText";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useAllTypesOperationsAppointment } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { DataCard } from "@/components/DataCard";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface WorkOrderFormProps {
  defaultValues: Partial<WorkOrderSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  workOrderData?: WorkOrderResource;
}

// Tipo Recall
const typeRecall = [
  { label: "Rojo", value: "ROJO" },
  { label: "Amarillo", value: "AMARILLO" },
  { label: "Verde", value: "VERDE" },
];

export const WorkOrderForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  workOrderData,
}: WorkOrderFormProps) => {
  const router = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<VehicleInspectionResource | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentPlanningResource | null>(null);
  const { ABSOLUTE_ROUTE } = WORKER_ORDER;

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? workOrderSchemaCreate : workOrderSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      has_appointment: defaultValues.has_appointment ?? false,
      has_inspection: defaultValues.has_inspection ?? false,
      items: defaultValues.items ?? [],
      diagnosis_date:
        defaultValues.diagnosis_date || defaultValues.opening_date,
    },
    mode: "onChange",
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });
  const { data: typesPlanning = [], isLoading: isLoadingTypesPlanning } =
    useAllTypesPlanning();

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperationsAppointment();

  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();

  const isLoading =
    isLoadingSedes ||
    isLoadingTypesPlanning ||
    isLoadingTypesOperation ||
    isLoadingCurrencyTypes;

  // Watch fields
  const watchedIsRecall = form.watch("is_recall");
  const watchedHasAppointment = form.watch("has_appointment");
  const watchedAppointmentId = form.watch("appointment_planning_id");
  const watchedHasInspection = form.watch("has_inspection");
  const watchedInspectionId = form.watch("vehicle_inspection_id");
  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });
  const watchedTypePlanningIds = useMemo(
    () =>
      (watchedItems ?? [])
        .map((item) => item?.type_planning_id)
        .filter((id): id is string => Boolean(id)),
    [watchedItems],
  );

  // Effect para cargar items desde la cita seleccionada
  useEffect(() => {
    if (selectedAppointment && watchedHasAppointment) {
      // Setear vehículo y sede desde la cita
      if (selectedAppointment.ap_vehicle_id) {
        form.setValue(
          "vehicle_id",
          selectedAppointment.ap_vehicle_id.toString(),
        );
        // Setear selectedVehicle para mostrar la info del vehículo
        if (selectedAppointment.vehicle) {
          setSelectedVehicle(selectedAppointment.vehicle);
        }
      }
      if (selectedAppointment.sede_id) {
        form.setValue("sede_id", selectedAppointment.sede_id.toString());
      }

      // Setear fecha y hora estimada de entrega desde la cita
      if (
        selectedAppointment.delivery_date &&
        selectedAppointment.delivery_time
      ) {
        const time = selectedAppointment.delivery_time.slice(0, 5); // "15:30:00" -> "15:30"
        form.setValue(
          "estimated_delivery_time",
          `${selectedAppointment.delivery_date}T${time}`,
        );
      }

      // Agregar item desde la cita solo si no hay items
      if (fields.length === 0) {
        append({
          group_number: 1,
          type_planning_id: selectedAppointment.type_planning_id.toString(),
          type_operation_id:
            selectedAppointment.type_operation_appointment_id.toString(),
          description: selectedAppointment.description || "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppointment]);

  // Limpiar appointment_planning_id cuando has_appointment es false
  useEffect(() => {
    if (!watchedHasAppointment && mode === "create") {
      form.setValue("appointment_planning_id", "");
      setSelectedAppointment(null);
      form.setValue("vehicle_id", "");
      setSelectedVehicle(null);
      // Limpiar todos los items si hay alguno
      if (fields.length > 0) {
        form.setValue("items", []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedHasAppointment]);

  // Limpiar vehicle_inspection_id y vehículo cuando has_inspection es false
  useEffect(() => {
    if (!watchedHasInspection && mode === "create") {
      form.setValue("vehicle_inspection_id", "");
      setSelectedInspection(null);
      // Limpiar el vehículo solo si no hay cita seleccionada
      if (!watchedHasAppointment || !watchedAppointmentId) {
        form.setValue("vehicle_id", "");
        setSelectedVehicle(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedHasInspection]);

  // Setear sede por defecto (primera sede taller disponible)
  useEffect(() => {
    if (mode === "create" && sedes.length > 0 && !form.getValues("sede_id")) {
      form.setValue("sede_id", sedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes, mode]);

  // Limpiar campos de recall cuando is_recall es false
  useEffect(() => {
    if (!watchedIsRecall) {
      form.setValue("type_recall", undefined);
      form.setValue("description_recall", "");
      form.trigger(["type_recall", "description_recall"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedIsRecall]);

  // Auto-setear type_operation_id cuando la descripcion de type_planning_id coincide con alguna operacion
  useEffect(() => {
    if (!watchedItems || watchedItems.length === 0) return;
    watchedItems.forEach((item, index) => {
      if (!item?.type_planning_id) return;
      const planning = typesPlanning.find(
        (tp) => tp.id.toString() === item.type_planning_id,
      );
      if (!planning) return;
      const matchedOperation = typesOperation.find(
        (to) => to.description === planning.description,
      );
      if (matchedOperation) {
        const currentOperationId = form.getValues(
          `items.${index}.type_operation_id`,
        );
        if (currentOperationId !== matchedOperation.id.toString()) {
          form.setValue(
            `items.${index}.type_operation_id`,
            matchedOperation.id.toString(),
            { shouldDirty: true, shouldValidate: true },
          );
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedTypePlanningIds, typesPlanning, typesOperation]);

  const handleAddItem = () => {
    append({
      group_number: 1,
      type_planning_id: "",
      type_operation_id: "",
      description: "-",
    });
  };

  const handleSelectAppointment = (
    appointment: AppointmentPlanningResource,
  ) => {
    // Resetear selectedVehicle primero para forzar re-sync del defaultOption
    // aunque se vuelva a seleccionar el mismo vehículo
    setSelectedVehicle(null);
    form.setValue("appointment_planning_id", appointment.id.toString());
    setSelectedAppointment(appointment);
  };

  const handleSelectInspection = (inspection: VehicleInspectionResource) => {
    form.setValue("vehicle_inspection_id", inspection.id.toString());
    setSelectedInspection(inspection);

    // Setear el vehículo desde la recepción
    if (inspection.vehicle_id) {
      form.setValue("vehicle_id", inspection.vehicle_id.toString());
      // Setear el selectedVehicle para mostrar la info del vehículo
      setSelectedVehicle({
        id: inspection.vehicle_id,
        plate: inspection.vehicle_plate,
        vin: inspection.vehicle_vin,
        model: {
          brand: inspection.vehicle_brand,
          version: inspection.vehicle_model,
        },
        year: inspection.vehicle_year,
        vehicle_color: inspection.vehicle_color,
      });
    }
  };

  const getSelectedAppointmentLabel = () => {
    if (!watchedAppointmentId || !selectedAppointment) return null;

    return `${selectedAppointment.full_name_client} - ${selectedAppointment.date_appointment} ${selectedAppointment.time_appointment}`;
  };

  const getSelectedInspectionLabel = () => {
    if (!watchedInspectionId || !selectedInspection) return null;

    const dateStr =
      typeof selectedInspection.inspection_date === "string"
        ? selectedInspection.inspection_date
        : selectedInspection.inspection_date?.toISOString().split("T")[0];

    return `${selectedInspection.vehicle_plate || "S/N"} - ${dateStr || "Sin fecha"}`;
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información General */}
        <GroupFormSection
          title="Información Cita"
          icon={FileText}
          color="primary"
          cols={{ sm: 1 }}
        >
          {/* Checkbox Tiene Cita */}
          <FormField
            control={form.control}
            name="has_appointment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Tiene cita?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque esta opción si la orden de trabajo proviene de una
                    cita programada
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Selector de Cita - Solo visible si has_appointment es true */}
          {watchedHasAppointment && (
            <FormField
              control={form.control}
              name="appointment_planning_id"
              render={() => (
                <FormItem>
                  <FormLabel>Cita de Planificación</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsAppointmentModalOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {getSelectedAppointmentLabel() ||
                          "Buscar y seleccionar cita"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </GroupFormSection>

        {/* Recepción de Vehículo */}
        <GroupFormSection
          title="Recepción de Vehículo"
          icon={ClipboardCheck}
          color="primary"
          cols={{ sm: 1 }}
        >
          {/* Checkbox Tiene Recepción */}
          <FormField
            control={form.control}
            name="has_inspection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>¿Tiene recepción registrada?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque esta opción si ya existe una recepción de vehículo
                    que desea asociar a esta orden de trabajo
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Selector de Recepción - Solo visible si has_inspection es true */}
          {watchedHasInspection && (
            <FormField
              control={form.control}
              name="vehicle_inspection_id"
              render={() => (
                <FormItem>
                  <FormLabel>Recepción de Vehículo</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsInspectionModalOpen(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {getSelectedInspectionLabel() ||
                          "Buscar y seleccionar recepción"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Información de la Recepción Seleccionada */}
          {selectedInspection && watchedHasInspection && (
            <DataCard
              title="INFORMACIÓN DE LA RECEPCIÓN"
              columns={3}
              fields={[
                {
                  key: "plate",
                  label: "Placa",
                  icon: Car,
                  value: selectedInspection.vehicle_plate || "—",
                },
                {
                  key: "vin",
                  label: "VIN",
                  icon: FileText,
                  value: selectedInspection.vehicle_vin || "—",
                },
                {
                  key: "date",
                  label: "Fecha Recepción",
                  icon: Calendar,
                  value:
                    (typeof selectedInspection.inspection_date === "string"
                      ? selectedInspection.inspection_date
                      : selectedInspection.inspection_date
                          ?.toISOString()
                          .split("T")[0]) || "—",
                },
                {
                  key: "mileage",
                  label: "Kilometraje",
                  icon: Gauge,
                  value: selectedInspection.mileage
                    ? `${selectedInspection.mileage.toLocaleString()} km`
                    : "—",
                },
                {
                  key: "order",
                  label: "OT Origen",
                  icon: FileCheck,
                  value: selectedInspection.work_order_correlative || "—",
                },
                {
                  key: "inspector",
                  label: "Inspeccionado por",
                  icon: User,
                  value: selectedInspection.inspected_by_name || "—",
                },
              ]}
            />
          )}
        </GroupFormSection>

        {/* Datos del Servicio */}
        <GroupFormSection
          title="Datos del Servicio"
          icon={Car}
          color="gray"
          cols={{ sm: 1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelectAsync
              name="vehicle_id"
              label="Vehículo"
              placeholder="Seleccione vehículo"
              control={form.control}
              useQueryHook={useVehicles}
              mapOptionFn={(item: VehicleResource) => ({
                value: item.id.toString(),
                label: `${item.vin || "S/N"} | ${item.plate || ""} | ${
                  item.model?.brand || ""
                }`,
              })}
              perPage={10}
              debounceMs={500}
              defaultOption={
                selectedVehicle
                  ? {
                      value: selectedVehicle.id.toString(),
                      label: `${selectedVehicle.vin || "S/N"} | ${
                        selectedVehicle.plate || ""
                      } | ${selectedVehicle.model?.brand || ""}`,
                    }
                  : workOrderData?.vehicle
                    ? {
                        value: workOrderData.vehicle.id.toString(),
                        label: `${workOrderData.vehicle.vin || "S/N"} | ${
                          workOrderData.vehicle.plate || ""
                        } | ${workOrderData.vehicle.model?.brand || ""}`,
                      }
                    : undefined
              }
              onValueChange={(_value, item) => {
                setSelectedVehicle(item || null);
              }}
              disabled={
                (watchedHasAppointment && Boolean(watchedAppointmentId)) ||
                (watchedHasInspection && Boolean(watchedInspectionId))
              }
            />

            <FormSelect
              name="sede_id"
              label="Sede Taller"
              placeholder="Seleccione sede"
              options={sedes.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={watchedHasAppointment && Boolean(watchedAppointmentId)}
            />
          </div>

          {/* Información del Vehículo Seleccionado */}
          {selectedVehicle && (
            <DataCard
              title="INFORMACIÓN DEL VEHÍCULO"
              columns={3}
              fields={[
                {
                  key: "plate",
                  label: "Placa",
                  icon: Car,
                  value: selectedVehicle.plate || "—",
                },
                {
                  key: "vin",
                  label: "VIN",
                  icon: FileText,
                  value: selectedVehicle.vin || "—",
                },
                {
                  key: "brand",
                  label: "Marca",
                  icon: Car,
                  value: selectedVehicle.model?.brand || "—",
                },
                {
                  key: "model",
                  label: "Modelo",
                  icon: FileText,
                  value: selectedVehicle.model?.version || "—",
                },
                {
                  key: "year",
                  label: "Año",
                  icon: Calendar,
                  value: selectedVehicle.year || "—",
                },
                {
                  key: "color",
                  label: "Color",
                  icon: Car,
                  value: selectedVehicle.vehicle_color || "—",
                },
                {
                  key: "engine_type",
                  label: "Motor",
                  icon: Gauge,
                  value: selectedVehicle.engine_type || "—",
                },
                {
                  key: "engine_number",
                  label: "Núm. Motor",
                  icon: FileText,
                  value: selectedVehicle.engine_number || "—",
                },
              ]}
            />
          )}
        </GroupFormSection>

        {/* Información de la OT */}
        <GroupFormSection
          title="Información de la OT"
          icon={Building}
          color="gray"
          cols={{ sm: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="currency_id"
            options={currencyTypes.map((type) => ({
              value: type.id.toString(),
              label: type.name,
            }))}
            label="Moneda"
            placeholder="Seleccionar moneda"
            required
          />

          {/* Fecha y Hora de Inicio con validación */}
          <DateTimePickerForm
            name="estimated_delivery_time"
            label="Fecha y Hora Estimada de Entrega"
            control={form.control}
            placeholder="Seleccione fecha y hora"
          />

          <FormSwitch
            name="is_guarantee"
            label="Vehículo en Garantía"
            text={form.watch("is_guarantee") ? "Sí" : "No"}
            control={form.control}
          />
          <FormSwitch
            name="is_recall"
            label="Recall"
            text={form.watch("is_recall") ? "Sí" : "No"}
            control={form.control}
          />
          {watchedIsRecall && (
            <>
              <FormSelect
                name="type_recall"
                label="Tipo Recall"
                placeholder="Seleccione tipo"
                options={typeRecall}
                control={form.control}
                strictFilter={true}
              />
              <FormInput
                name="description_recall"
                label="Descripción Recall"
                placeholder="Ingrese el detalle del recall"
                control={form.control}
              />
            </>
          )}
        </GroupFormSection>

        {/* Items de Servicio */}
        {mode === "create" && (
          <GroupFormSection
            title="Trabajos"
            icon={List}
            color="primary"
            cols={{ sm: 1 }}
          >
            <div className="space-y-4">
              {fields.map((field, index) => {
                const groupNumber =
                  form.watch(`items.${index}.group_number`) || 1;
                const colors = getGroupColor(groupNumber);

                return (
                  <Card
                    key={field.id}
                    className="p-4 border-2 border-gray-200 bg-white hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className="text-white"
                          style={{
                            backgroundColor: colors.badge,
                          }}
                        >
                          Grupo {groupNumber}
                        </Badge>
                        <h5 className="font-semibold text-gray-700">
                          Trabajo #{index + 1}
                        </h5>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Fila 1: Grupo, Tipo de Planificación y Tipo de Operación */}
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                          <FormInput
                            name={`items.${index}.group_number`}
                            label="Grupo"
                            type="number"
                            min={1}
                            max={20}
                            className={`text-center ${colors.input}`}
                            control={form.control}
                            disabled
                          />
                        </div>

                        <div className="col-span-5">
                          <FormSelect
                            name={`items.${index}.type_planning_id`}
                            label="Tipo de Planificación"
                            placeholder="Seleccione tipo"
                            options={typesPlanning.map((item) => ({
                              label: item.description,
                              value: item.id.toString(),
                            }))}
                            control={form.control}
                            strictFilter={true}
                          />
                        </div>

                        <div className="col-span-5">
                          <FormSelect
                            name={`items.${index}.type_operation_id`}
                            label="Tipo de Operación"
                            placeholder="Seleccione operación"
                            options={typesOperation.map((item) => ({
                              label: item.description,
                              value: item.id.toString(),
                            }))}
                            control={form.control}
                            strictFilter={true}
                            onValueChange={(value) => {
                              const found = typesOperation.find(
                                (p) => p.id.toString() === value,
                              );
                              if (found) {
                                form.setValue(
                                  `items.${index}.description`,
                                  found.description,
                                );
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Fila 2: Descripción */}
                      <FormInputText
                        name={`items.${index}.description`}
                        label="Descripción del Trabajo"
                        placeholder="Ingrese la descripción del trabajo..."
                        control={form.control}
                      />
                    </div>
                  </Card>
                );
              })}

              {fields.length === 0 && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Trabajo
                  </Button>
                </div>
              )}
            </div>
          </GroupFormSection>
        )}

        {/* Observaciones */}
        <GroupFormSection
          title="Observaciones"
          icon={FileText}
          color="gray"
          cols={{ sm: 1 }}
        >
          <FormInputText
            name="observations"
            label="Observaciones"
            placeholder="Ingrese observaciones adicionales..."
            control={form.control}
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              router(ABSOLUTE_ROUTE!);
            }}
          />

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Orden de Trabajo"}
          </Button>
        </div>

        {/* Modal de Selección de Cita */}
        <AppointmentSelectionModal
          open={isAppointmentModalOpen}
          sedeId={Number(form.getValues("sede_id"))}
          onOpenChange={setIsAppointmentModalOpen}
          onSelectAppointment={handleSelectAppointment}
        />

        {/* Modal de Selección de Recepción */}
        <VehicleInspectionSelectionModal
          open={isInspectionModalOpen}
          sedeId={Number(form.getValues("sede_id"))}
          onOpenChange={setIsInspectionModalOpen}
          onSelectInspection={handleSelectInspection}
        />
      </form>
    </Form>
  );
};
