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
import { Loader, Calendar, Car, User, ExternalLink } from "lucide-react";
import {
  AppointmentPlanningSchema,
  appointmentPlanningSchemaCreate,
  appointmentPlanningSchemaUpdate,
} from "../lib/appointmentPlanning.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllTypesOperationsAppointment } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import {
  useAllVehicles,
  useVehicles,
} from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Textarea } from "@/components/ui/textarea";
import AppointmentTimeSlotPicker from "./AppointmentTimeSlotPicker";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { EMPRESA_AP } from "@/core/core.constants";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { APPOINTMENT_PLANNING } from "../lib/appointmentPlanning.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { VEHICLES_TLL } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import {
  useDniValidation,
  useRucValidation,
} from "@/shared/hooks/useDocumentValidation";

interface AppointmentPlanningFormProps {
  defaultValues: Partial<AppointmentPlanningSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  appointmentPlanningData?: AppointmentPlanningResource;
}

export const AppointmentPlanningForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  appointmentPlanningData,
}: AppointmentPlanningFormProps) => {
  const router = useNavigate();
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] =
    useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");
  const { ABSOLUTE_ROUTE } = APPOINTMENT_PLANNING;

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? appointmentPlanningSchemaCreate
        : appointmentPlanningSchemaUpdate,
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
  const watchVehicleId = form.watch("ap_vehicle_id");
  const watchCustomer = form.watch("num_doc_client");

  // Detectar el tipo de documento basado en la longitud
  const isDni = watchCustomer?.length === 8;
  const isRuc = watchCustomer?.length === 11;

  // Validación DNI (8 dígitos)
  const {
    data: dniData,
    isLoading: isDniLoading,
    error: dniError,
  } = useDniValidation(
    watchCustomer,
    !isFirstLoad && !!watchCustomer && isDni,
    true,
  );

  // Validación RUC (11 dígitos)
  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(
    watchCustomer,
    !isFirstLoad && !!watchCustomer && isRuc,
    true,
  );

  // Datos consolidados
  const customerData = dniData || rucData;
  const customerError = dniError || rucError;
  const isCustomerLoading = isDniLoading || isRucLoading;

  // Effect para cargar datos del cliente cuando se selecciona un vehículo
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    if (watchVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id.toString() === watchVehicleId);
      setSelectedVehicle(vehicle);

      // Si el vehículo tiene cliente (owner), autocompletar los campos
      if (vehicle?.owner && vehicle.owner !== null) {
        const client = vehicle.owner;
        form.setValue("num_doc_client", client.num_doc || "");
        form.setValue("full_name_client", client.full_name || "");
        form.setValue("email_client", client.email || "");
        form.setValue("phone_client", client.phone || "");
      } else {
        form.setValue("num_doc_client", "");
        form.setValue("full_name_client", "");
        form.setValue("email_client", "");
        form.setValue("phone_client", "");
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [watchVehicleId, vehicles, form]);

  // UseEffect para autocompletar datos del cliente
  useEffect(() => {
    if (isFirstLoad) return;

    if (customerData?.success && customerData.data) {
      // Si es DNI (persona natural)
      if (dniData?.success && dniData.data) {
        const clientInfo = dniData.data;
        form.setValue("full_name_client", clientInfo.names || "");
      }
      // Si es RUC (persona jurídica)
      else if (rucData?.success && rucData.data) {
        const clientInfo = rucData.data;
        form.setValue("full_name_client", clientInfo.business_name || "");
      }
    } else if (customerData && !customerData.success) {
      form.setValue("full_name_client", "");
    }
  }, [customerData, dniData, rucData, form, isFirstLoad]);

  // Deshabilitar campos de cliente si se encontró información
  const shouldDisableCustomerFields = Boolean(
    customerData?.success && customerData.data,
  );

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
          <FormSelectAsync
            placeholder="Seleccionar vehículo"
            control={form.control}
            label={"Vehículo"}
            name="ap_vehicle_id"
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
              appointmentPlanningData?.vehicle
                ? {
                    value: appointmentPlanningData.vehicle.id.toString(),
                    label: `${appointmentPlanningData.vehicle.vin || "S/N"} | ${
                      appointmentPlanningData.vehicle.plate || ""
                    } | ${appointmentPlanningData.vehicle.model?.brand || ""}`,
                  }
                : undefined
            }
          >
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="aspect-square"
              onClick={() => window.open(VEHICLES_TLL.ROUTE_ADD, "_blank")}
              tooltip="Agregar nuevo vehículo"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </FormSelectAsync>

          <FormField
            control={form.control}
            name="num_doc_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 relative">
                  Cliente DNI/RUC
                  <DocumentValidationStatus
                    shouldValidate={true}
                    documentNumber={watchCustomer || ""}
                    expectedDigits={isDni ? 8 : isRuc ? 11 : 0}
                    isValidating={isCustomerLoading}
                    leftPosition="right-0"
                  />
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="8 dígitos (DNI) o 11 dígitos (RUC)"
                      {...field}
                      maxLength={11}
                      type="number"
                    />
                    <ValidationIndicator
                      show={!!watchCustomer}
                      isValidating={isCustomerLoading}
                      isValid={customerData?.success && !!customerData.data}
                      hasError={
                        !!customerError ||
                        (customerData && !customerData.success)
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name_client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del cliente"
                    {...field}
                    disabled={shouldDisableCustomerFields}
                  />
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
                    {selectedVehicle.owner !== null && (
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
                              {selectedVehicle.owner.full_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Documento</p>
                            <p className="font-medium text-sm">
                              {selectedVehicle.owner.num_doc}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="font-medium text-sm">
                              {selectedVehicle.owner.phone || "N/A"}
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
