"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Fuel,
  Gauge,
  User,
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { findAppointmentPlanningById } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.actions";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function GeneralInformationPage() {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);

  // Fetch work order data
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
  });

  // Fetch appointment data if exists
  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["appointment", workOrder?.appointment_planning_id],
    queryFn: () =>
      findAppointmentPlanningById(Number(workOrder?.appointment_planning_id)),
    enabled: !!workOrder?.appointment_planning_id,
  });

  if (isLoading || isLoadingAppointment) {
    return <FormSkeleton />;
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Orden de trabajo no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Información General</h1>
              <p className="text-sm text-gray-600 mt-1 font-bold">
                #: {workOrder.correlative} - Placa: {workOrder.vehicle_plate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-600">Estado</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                ID: {workOrder.status_id}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      <div className="grid gap-6">
        {/* Vehicle Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Información del Vehículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Placa</p>
              <p className="font-semibold">
                {workOrder.vehicle_plate || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">VIN</p>
              <p className="font-semibold">{workOrder.vehicle_vin || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modelo</p>
              <p className="font-semibold">
                {workOrder.vehicle.model.version || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marca</p>
              <p className="font-semibold">
                {workOrder.vehicle.model.brand || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* Appointment Information */}
        {appointment ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la Cita
              </h3>
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
                      },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hora de Cita</p>
                  <p className="font-semibold">
                    {appointment.time_appointment}
                  </p>
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
                      },
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
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Planificación</p>
                  <p className="font-semibold">
                    {appointment.type_planning_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">
                    {appointment.full_name_client}
                  </p>
                </div>
              </div>
            </div>
            {appointment.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Descripción de la Cita
                </p>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                  {appointment.description}
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center gap-3 text-gray-500">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="text-lg font-semibold">No hay cita asociada</h3>
                <p className="text-sm">
                  Esta orden de trabajo no tiene una cita previa asociada
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quotation Information */}
        {workOrder.order_quotation ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de la Cotización
              </h3>
              <Badge color="default">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {workOrder.order_quotation.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Número de Cotización</p>
                  <p className="font-semibold">
                    {workOrder.order_quotation.quotation_number}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">
                    {workOrder.order_quotation.customer}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Cotización</p>
                  <p className="font-semibold">
                    {new Date(
                      workOrder.order_quotation.quotation_date,
                    ).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Expiración</p>
                  <p className="font-semibold">
                    {new Date(
                      workOrder.order_quotation.expiration_date,
                    ).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Vigencia</p>
                  <p className="font-semibold">
                    {workOrder.order_quotation.validity_days} días
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Creado por</p>
                  <p className="font-semibold">
                    {workOrder.order_quotation.created_by_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Montos */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">
                    {workOrder.order_quotation.type_currency?.symbol || "S/"}{" "}
                    {Number(workOrder.order_quotation.subtotal).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Descuento</p>
                  <p className="text-lg font-bold text-orange-600">
                    {workOrder.order_quotation.type_currency?.symbol || "S/"}{" "}
                    {Number(workOrder.order_quotation.discount_amount).toFixed(
                      2,
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    IGV ({workOrder.order_quotation.tax_amount}%)
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {workOrder.order_quotation.type_currency?.symbol || "S/"}{" "}
                    {(
                      (Number(workOrder.order_quotation.subtotal) -
                        Number(workOrder.order_quotation.discount_amount)) *
                      (Number(workOrder.order_quotation.tax_amount) / 100)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg border-2 border-primary">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-xl font-bold text-primary">
                    {workOrder.order_quotation.type_currency?.symbol || "S/"}{" "}
                    {Number(workOrder.order_quotation.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Observaciones de la cotización */}
            {workOrder.order_quotation.observations && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Observaciones de la Cotización
                </p>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                  {workOrder.order_quotation.observations}
                </p>
              </div>
            )}
          </Card>
        ) : null}

        {/* Work Order Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalles de la Orden</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Correlativo</p>
                <p className="font-semibold">
                  {workOrder.correlative || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Fecha de Apertura</p>
                <p className="font-semibold">
                  {workOrder.opening_date
                    ? new Date(workOrder.opening_date).toLocaleDateString(
                        "es-PE",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">
                  Fecha Estimada de Entrega
                </p>
                <p className="font-semibold">
                  {workOrder.estimated_delivery_date
                    ? new Date(
                        workOrder.estimated_delivery_date,
                      ).toLocaleDateString("es-PE")
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Fecha Real de Entrega</p>
                <p className="font-semibold">
                  {workOrder.actual_delivery_date
                    ? new Date(
                        workOrder.actual_delivery_date,
                      ).toLocaleDateString("es-PE")
                    : "- / - / -"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Fecha de Diagnóstico</p>
                <p className="font-semibold">
                  {workOrder.diagnosis_date
                    ? new Date(workOrder.diagnosis_date).toLocaleDateString(
                        "es-PE",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Asesor</p>
                <p className="font-semibold">
                  {workOrder.advisor_name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Sede</p>
                <p className="font-semibold">{workOrder.sede_name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CircleDollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Moneda</p>
                <p className="font-semibold">
                  {workOrder.type_currency.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Inspection */}
        {workOrder.vehicle_inspection && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Inspección del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <Gauge className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Kilometraje</p>
                  <p className="font-semibold">
                    {workOrder.vehicle_inspection.mileage} km
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Fuel className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nivel de Combustible</p>
                  <p className="font-semibold">
                    {workOrder.vehicle_inspection.fuel_level}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Fuel className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nivel de Aceite</p>
                  <p className="font-semibold">
                    {workOrder.vehicle_inspection.oil_level || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Inspección</p>
                  <p className="font-semibold">
                    {new Date(
                      workOrder.vehicle_inspection.inspection_date,
                    ).toLocaleDateString("es-PE")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Registrado por</p>
                  <p className="font-semibold">
                    {workOrder.vehicle_inspection.inspected_by_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Daños Registrados</p>
                  <p className="font-semibold">
                    {workOrder.vehicle_inspection.damages?.length || 0} daños
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Estado de Facturación
            </h3>
            <div className="flex items-center gap-3">
              <Badge color={workOrder.is_invoiced ? "default" : "secondary"}>
                {workOrder.is_invoiced ? "Facturado" : "No Facturado"}
              </Badge>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Información Adicional
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">ID Cita</p>
                <p className="font-semibold">
                  {workOrder.appointment_planning_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Estado</p>
                <p className="font-semibold">{workOrder.status_id || "N/A"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Observations */}
        {workOrder.observations && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {workOrder.observations}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
