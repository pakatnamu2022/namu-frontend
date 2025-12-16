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
  Trash2,
  List,
  Search,
} from "lucide-react";
import {
  WorkOrderSchema,
  workOrderSchemaCreate,
  workOrderSchemaUpdate,
} from "../lib/workOrder.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EMPRESA_AP } from "@/core/core.constants";
import { useAllAppointmentPlanning } from "../../citas/lib/appointmentPlanning.hook";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { DEFAULT_GROUP_COLOR, GROUP_COLORS } from "../lib/workOrder.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { AppointmentSelectionModal } from "../../citas/components/AppointmentSelectionModal";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface WorkOrderFormProps {
  defaultValues: Partial<WorkOrderSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const WorkOrderForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: WorkOrderFormProps) => {
  const router = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const { ABSOLUTE_ROUTE } = WORKER_ORDER;

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? workOrderSchemaCreate : workOrderSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      has_appointment: defaultValues.has_appointment ?? false,
      items: defaultValues.items ?? [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useAllVehicles();
  const { data: appointments = [], isLoading: isLoadingAppointments } =
    useAllAppointmentPlanning({ is_taken: 0 });
  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });
  const { data: typesPlanning = [], isLoading: isLoadingTypesPlanning } =
    useAllTypesPlanning();

  const isLoading =
    isLoadingVehicles ||
    isLoadingAppointments ||
    isLoadingSedes ||
    isLoadingTypesPlanning;

  // Watch fields
  const watchedVehicleId = form.watch("vehicle_id");
  const watchedHasAppointment = form.watch("has_appointment");
  const watchedAppointmentId = form.watch("appointment_planning_id");

  // Effect para cargar información del vehículo cuando se selecciona
  useEffect(() => {
    if (watchedVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(
        (v) => v.id.toString() === watchedVehicleId
      );
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
  }, [watchedVehicleId, vehicles]);

  // Effect para cargar items desde la cita seleccionada
  useEffect(() => {
    if (
      watchedAppointmentId &&
      watchedHasAppointment &&
      appointments.length > 0
    ) {
      const appointment = appointments.find(
        (a) => a.id.toString() === watchedAppointmentId
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
    if (!watchedHasAppointment) {
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

  const handleAddItem = () => {
    const lastGroup =
      fields.length > 0 ? fields[fields.length - 1].group_number : 0;
    append({
      group_number: lastGroup + 1,
      type_planning_id: "",
      description: "-",
    });
  };

  const handleSelectAppointment = (appointmentId: string) => {
    form.setValue("appointment_planning_id", appointmentId);
  };

  const getSelectedAppointmentLabel = () => {
    if (!watchedAppointmentId || appointments.length === 0) return null;

    const appointment = appointments.find(
      (a) => a.id.toString() === watchedAppointmentId
    );

    if (!appointment) return null;

    return `${appointment.full_name_client} - ${appointment.date_appointment} ${appointment.time_appointment}`;
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

        {/* Datos del Servicio */}
        <GroupFormSection
          title="Datos del Servicio"
          icon={Car}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 2 }}
        >
          <FormSelect
            name="vehicle_id"
            label="Vehículo"
            placeholder="Seleccione vehículo"
            options={vehicles.map((item) => ({
              label: `(${item.plate || "S/N"}) ${item.model?.brand || ""} ${
                item.model?.version || ""
              } (${item.year || ""})`,
              value: item.id.toString(),
            }))}
            control={form.control}
            strictFilter={true}
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

        {/* Items de Servicio */}
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
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Fila 1: Grupo y Tipo de Planificación */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.group_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Grupo</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="20"
                                  className={`text-center h-10 ${colors.input}`}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-10">
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
                    </div>

                    {/* Fila 2: Descripción */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ingrese la descripción del servicio..."
                              rows={2}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              );
            })}

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
        </GroupFormSection>

        {/* Fechas */}
        <GroupFormSection
          title="Fechas"
          icon={Building}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 2, md: 3 }}
        >
          <DatePickerFormField
            control={form.control}
            name="opening_date"
            label="Fecha de Apertura"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabled={true}
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

          <DatePickerFormField
            control={form.control}
            name="diagnosis_date"
            label="Fecha de Diagnóstico"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{ after: new Date() }}
          />
        </GroupFormSection>

        {/* Observaciones */}
        <GroupFormSection
          title="Observaciones"
          icon={FileText}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 1 }}
        >
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingrese observaciones adicionales..."
                    rows={4}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
      </form>
    </Form>
  );
};
