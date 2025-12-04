import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { findAppointmentPlanningById } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.actions";

interface AppointmentTabProps {
  workOrderId: number;
}

export default function AppointmentTab({ workOrderId }: AppointmentTabProps) {
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["appointment", workOrder?.appointment_planning_id],
    queryFn: () =>
      findAppointmentPlanningById(Number(workOrder?.appointment_planning_id)),
    enabled: !!workOrder?.appointment_planning_id,
  });

  if (isLoadingWorkOrder || isLoadingAppointment) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando información de la cita...</p>
        </div>
      </Card>
    );
  }

  const hasAppointment = !!appointment;

  if (!hasAppointment) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay cita asociada
          </h3>
          <p className="text-gray-500">
            Esta orden de trabajo no tiene una cita previa asociada
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Appointment Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Información de la Cita</h3>
          <Badge>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Agendada
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Cita</p>
              <p className="font-semibold">
                {new Date(appointment.date_appointment).toLocaleDateString(
                  "es-PE",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Hora de Cita</p>
              <p className="font-semibold">{appointment.time_appointment}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Entrega</p>
              <p className="font-semibold">
                {new Date(appointment.delivery_date).toLocaleDateString(
                  "es-PE",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Hora de Entrega</p>
              <p className="font-semibold">{appointment.delivery_time}</p>
            </div>
          </div>

          {workOrder && (
            <>
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Asesor Asignado</p>
                  <p className="font-semibold">{workOrder.advisor_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Sede</p>
                  <p className="font-semibold">{workOrder.sede_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Planificación</p>
                  <p className="font-semibold">
                    {appointment.type_planning_name}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-semibold">{appointment.full_name_client}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-semibold">{appointment.phone_client}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{appointment.email_client}</p>
          </div>
        </div>
      </Card>

      {/* Description */}
      {appointment.description && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Descripción de la Cita</h3>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {appointment.description}
          </p>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Línea de Tiempo</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-full bg-gray-300"></div>
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium">Cita Agendada</p>
              <p className="text-sm text-gray-600">
                {new Date(
                  appointment.date_appointment +
                    " " +
                    appointment.time_appointment
                ).toLocaleString("es-PE")}
              </p>
            </div>
          </div>

          {workOrder && (
            <>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-300"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Orden de Trabajo Creada</p>
                  <p className="text-sm text-gray-600">
                    {new Date(workOrder.opening_date).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Entrega Estimada</p>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      appointment.delivery_date +
                        " " +
                        appointment.delivery_time
                    ).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
