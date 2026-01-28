import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { useAllAppointmentPlanning } from "../../citas/lib/appointmentPlanning.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
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

  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAllAppointmentPlanning({ is_taken: 0 });
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
    isLoadingAppointments ||
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

  // Effect para cargar items desde la cita seleccionada
  useEffect(() => {
    if (
      watchedAppointmentId &&
      watchedHasAppointment &&
      appointments.length > 0
    ) {
      const appointment = appointments.find(
        (a) => a.id.toString() === watchedAppointmentId,
      );

      if (appointment) {
        // Setear vehículo y sede desde la cita
        if (appointment.ap_vehicle_id) {
          form.setValue("vehicle_id", appointment.ap_vehicle_id.toString());
        }
        if (appointment.sede_id) {
          form.setValue("sede_id", appointment.sede_id.toString());
        }

        // Agregar item desde la cita solo si no hay items
        if (fields.length === 0) {
          append({
            group_number: 1,
            type_planning_id: appointment.type_planning_id.toString(),
            type_operation_id:
              appointment.type_operation_appointment_id.toString(),
            description: appointment.description || "",
          });
        }
      }
    }
  }, [
    watchedAppointmentId,
    watchedHasAppointment,
    appointments,
    append,
    fields.length,
    form,
  ]);

  // Limpiar appointment_planning_id cuando has_appointment es false
  useEffect(() => {
    if (!watchedHasAppointment && mode === "create") {
      form.setValue("appointment_planning_id", "");
      form.setValue("vehicle_id", "");
      form.setValue("sede_id", "");
      // Limpiar todos los items si hay alguno
      if (fields.length > 0) {
        form.setValue("items", []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedHasAppointment]);

  // Limpiar vehicle_inspection_id cuando has_inspection es false
  useEffect(() => {
    if (!watchedHasInspection && mode === "create") {
      form.setValue("vehicle_inspection_id", "");
      setSelectedInspection(null);
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedIsRecall]);

  const handleAddItem = () => {
    append({
      group_number: 1,
      type_planning_id: "",
      type_operation_id: "",
      description: "-",
    });
  };

  const handleSelectAppointment = (appointmentId: string) => {
    form.setValue("appointment_planning_id", appointmentId);
  };

  const handleSelectInspection = (inspection: VehicleInspectionResource) => {
    form.setValue("vehicle_inspection_id", inspection.id.toString());
    setSelectedInspection(inspection);
  };

  const getSelectedAppointmentLabel = () => {
    if (!watchedAppointmentId || appointments.length === 0) return null;

    const appointment = appointments.find(
      (a) => a.id.toString() === watchedAppointmentId,
    );

    if (!appointment) return null;

    return `${appointment.full_name_client} - ${appointment.date_appointment} ${appointment.time_appointment}`;
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
          iconColor="text-primary"
          bgColor="bg-blue-50"
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

        {/* Inspección de Vehículo */}
        <GroupFormSection
          title="Inspección de Vehículo"
          icon={ClipboardCheck}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 1 }}
        >
          {/* Checkbox Tiene Inspección */}
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
                  <FormLabel>¿Tiene inspección registrada?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque esta opción si ya existe una inspección de vehículo
                    que desea asociar a esta orden de trabajo
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Selector de Inspección - Solo visible si has_inspection es true */}
          {watchedHasInspection && (
            <FormField
              control={form.control}
              name="vehicle_inspection_id"
              render={() => (
                <FormItem>
                  <FormLabel>Inspección de Vehículo</FormLabel>
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
                          "Buscar y seleccionar inspección"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Información de la Inspección Seleccionada */}
          {selectedInspection && watchedHasInspection && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-800">
                  Información de la Inspección
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Placa</p>
                  <p className="font-semibold text-sm">
                    {selectedInspection.vehicle_plate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-semibold text-sm">
                    {selectedInspection.vehicle_vin || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha Inspección</p>
                  <p className="font-semibold text-sm">
                    {typeof selectedInspection.inspection_date === "string"
                      ? selectedInspection.inspection_date
                      : selectedInspection.inspection_date
                          ?.toISOString()
                          .split("T")[0] || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kilometraje</p>
                  <p className="font-semibold text-sm">
                    {selectedInspection.mileage
                      ? `${selectedInspection.mileage} km`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">OT Origen</p>
                  <p className="font-semibold text-sm">
                    {selectedInspection.work_order_correlative || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Inspeccionado por</p>
                  <p className="font-semibold text-sm">
                    {selectedInspection.inspected_by_name || "N/A"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </GroupFormSection>

        {/* Datos del Servicio */}
        <GroupFormSection
          title="Datos del Servicio"
          icon={Car}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 2 }}
        >
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
              workOrderData?.vehicle
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
            disabled={watchedHasAppointment && Boolean(watchedAppointmentId)}
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
        </GroupFormSection>

        {/* Información del Vehículo Seleccionado */}
        {selectedVehicle && (
          <Card className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Car className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-gray-800">
                Información del Vehículo
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Placa</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.plate || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">VIN</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.vin || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Marca</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.model?.brand || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Modelo</p>
                <p className="font-semibold text-sm truncate">
                  {selectedVehicle.model?.version || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Año</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.year || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Color</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.vehicle_color || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Motor</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.engine_type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Núm. Motor</p>
                <p className="font-semibold text-sm">
                  {selectedVehicle.engine_number || "N/A"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Información de la OT */}
        <GroupFormSection
          title="Información de la OT"
          icon={Building}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
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
          <DatePickerFormField
            control={form.control}
            name="estimated_delivery_date"
            label="Fecha Estimada de Entrega"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{ before: new Date() }}
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
            iconColor="text-primary"
            bgColor="bg-blue-50"
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
                            className={`text-center h-10 ${colors.input}`}
                            control={form.control}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Trabajo
                </Button>
              )}
            </div>
          </GroupFormSection>
        )}

        {/* Observaciones */}
        <GroupFormSection
          title="Observaciones"
          icon={FileText}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
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
            {isSubmitting ? "Guardando" : "Guardar Orden"}
          </Button>
        </div>

        {/* Modal de Selección de Cita */}
        <AppointmentSelectionModal
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
          onSelectAppointment={handleSelectAppointment}
        />

        {/* Modal de Selección de Inspección */}
        <VehicleInspectionSelectionModal
          open={isInspectionModalOpen}
          onOpenChange={setIsInspectionModalOpen}
          onSelectInspection={handleSelectInspection}
        />
      </form>
    </Form>
  );
};
