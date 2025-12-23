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
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
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

  if (isLoading) {
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
                        "es-PE"
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
                        workOrder.estimated_delivery_date
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
                        workOrder.actual_delivery_date
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
                        "es-PE"
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
                      workOrder.vehicle_inspection.inspection_date
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
              <Badge variant={workOrder.is_invoiced ? "default" : "secondary"}>
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
