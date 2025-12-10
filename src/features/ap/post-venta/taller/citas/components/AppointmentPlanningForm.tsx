import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Calendar, Car, User } from "lucide-react";
import {
  AppointmentPlanningSchema,
  appointmentPlanningSchemaCreate,
  appointmentPlanningSchemaUpdate,
} from "../lib/appointmentPlanning.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllTypesOperationsAppointment } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { useAllVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Textarea } from "@/components/ui/textarea";
import AppointmentTimeSlotPicker from "./AppointmentTimeSlotPicker";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EMPRESA_AP } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { APPOINTMENT_PLANNING } from "../lib/appointmentPlanning.constants";

interface AppointmentPlanningFormProps {
  defaultValues: Partial<AppointmentPlanningSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const AppointmentPlanningForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: AppointmentPlanningFormProps) => {
  const router = useNavigate();
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] =
    useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const { ABSOLUTE_ROUTE } = APPOINTMENT_PLANNING;

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? appointmentPlanningSchemaCreate
        : appointmentPlanningSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: typesOperations = [], isLoading: isLoadingOperations } =
    useAllTypesOperationsAppointment();
  const { data: typesPlanning = [], isLoading: isLoadingPlanning } =
    useAllTypesPlanning();
  const { data: vehicles = [], isLoading: isLoadingVehicles } =
    useAllVehicles();
  const { data: sedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });

  const isLoading =
    isLoadingOperations ||
    isLoadingPlanning ||
    isLoadingVehicles ||
    isLoadingSedes;

  // Watch vehicle selection
  const watchedVehicleId = form.watch("ap_vehicle_id");

  // Effect para cargar datos del cliente cuando se selecciona un vehículo
  useEffect(() => {
    if (watchedVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(
        (v) => v.id.toString() === watchedVehicleId
      );
      setSelectedVehicle(vehicle);

      // Si el vehículo tiene cliente (owner), autocompletar los campos
      if (vehicle?.owner?.client) {
        const client = vehicle.owner.client;
        form.setValue("full_name_client", client.full_name || "");
        form.setValue("email_client", client.email || "");
        form.setValue("phone_client", client.phone || "");
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [watchedVehicleId, vehicles, form]);

  // Normalizar formato de hora a HH:mm
  const normalizeTime = (time: string): string => {
    if (!time) return time;
    // Si tiene formato HH:mm:ss, convertir a HH:mm
    if (time.includes(":")) {
      const parts = time.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const handleAppointmentTimeSlotSelect = (date: string, time: string) => {
    form.setValue("date_appointment", date, { shouldValidate: true });
    form.setValue("time_appointment", normalizeTime(time), {
      shouldValidate: true,
    });
  };

  const handleDeliveryTimeSlotSelect = (date: string, time: string) => {
    form.setValue("delivery_date", date, { shouldValidate: true });
    form.setValue("delivery_time", normalizeTime(time), {
      shouldValidate: true,
    });
  };

  const handleFormSubmit = (data: any) => {
    // Normalizar tiempos antes de enviar
    const normalizedData = {
      ...data,
      time_appointment: normalizeTime(data.time_appointment || ""),
      delivery_time: normalizeTime(data.delivery_time || ""),
    };
    onSubmit(normalizedData);
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/* Información del Cliente */}
        <GroupFormSection
          title="Información del Cliente"
          icon={Calendar}
          iconColor="text-primary"
          bgColor="bg-blue-50"
          cols={{ sm: 2, md: 3 }}
        >
          <FormSelect
            name="ap_vehicle_id"
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

          <FormField
            control={form.control}
            name="full_name_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono del cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

        {/* Información de la Cita */}
        <GroupFormSection
          title="Información de la Cita"
          icon={Calendar}
          iconColor="text-gray-800"
          bgColor="bg-gray-50"
          cols={{ sm: 1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <FormSelect
              name="type_operation_appointment_id"
              label="Tipo de Operación"
              placeholder="Seleccione tipo"
              options={typesOperations.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />

            <FormSelect
              name="type_planning_id"
              label="Tipo de Planificación"
              placeholder="Seleccione tipo"
              options={typesPlanning.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />

            {/* Información del Vehículo Seleccionado */}
            {selectedVehicle && (
              <div className="col-span-1 md:col-span-3">
                <Card className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">
                      Información del Vehículo
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <p className="text-xs text-gray-500">N° Motor</p>
                      <p className="font-semibold text-sm">
                        {selectedVehicle.engine_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estado</p>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor:
                            selectedVehicle.status_color || "#gray",
                        }}
                      >
                        {selectedVehicle.vehicle_status || "N/A"}
                      </Badge>
                    </div>
                    {selectedVehicle.owner?.client && (
                      <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <p className="text-xs font-semibold text-gray-700">
                            Propietario
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Nombre</p>
                            <p className="font-medium text-sm">
                              {selectedVehicle.owner.client.full_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Documento</p>
                            <p className="font-medium text-sm">
                              {selectedVehicle.owner.client.num_doc}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="font-medium text-sm">
                              {selectedVehicle.owner.client.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            <div className="col-span-1 md:col-span-3">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-gray-800">
                        Fecha y Hora de la Cita
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Selecciona un horario disponible haciendo clic en el
                      botón. Los horarios se asignan en intervalos de 15
                      minutos.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date_appointment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Cita</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                readOnly
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time_appointment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Cita</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                readOnly
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowAppointmentTimePicker(true)}
                    className="w-full lg:w-auto lg:ml-4 bg-primary hover:bg-primary shrink-0"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="whitespace-nowrap">
                      Ver Horarios Disponibles
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="bg-red-50 p-4 md:p-6 rounded-lg border-2 border-red-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-gray-800">
                        Fecha y Hora de Entrega
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Selecciona cuándo se entregará el vehículo al cliente.
                      También disponible en intervalos de 15 minutos.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Entrega</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                readOnly
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="delivery_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Entrega</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                readOnly
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowDeliveryTimePicker(true)}
                    className="w-full lg:w-auto lg:ml-4 bg-red-600 hover:bg-red-700 shrink-0"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="whitespace-nowrap">
                      Ver Horarios Disponibles
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la cita"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            {isSubmitting ? "Guardando" : "Guardar Cita"}
          </Button>
        </div>

        {/* Appointment Time Slot Picker Modal */}
        <AppointmentTimeSlotPicker
          open={showAppointmentTimePicker}
          onClose={() => setShowAppointmentTimePicker(false)}
          onSelect={handleAppointmentTimeSlotSelect}
          selectedDate={form.watch("date_appointment")}
          selectedTime={form.watch("time_appointment")}
        />

        {/* Delivery Time Slot Picker Modal */}
        <AppointmentTimeSlotPicker
          open={showDeliveryTimePicker}
          onClose={() => setShowDeliveryTimePicker(false)}
          onSelect={handleDeliveryTimeSlotSelect}
          selectedDate={form.watch("delivery_date")}
          selectedTime={form.watch("delivery_time")}
        />
      </form>
    </Form>
  );
};
