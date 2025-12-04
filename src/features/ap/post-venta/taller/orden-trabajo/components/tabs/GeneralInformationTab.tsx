import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkOrderResource } from "../../lib/workOrder.interface";
import {
  Calendar,
  User,
  Building2,
  Gauge,
  Fuel,
  Wrench,
  FileText,
} from "lucide-react";

interface GeneralInformationTabProps {
  workOrder: WorkOrderResource;
}

export default function GeneralInformationTab({
  workOrder,
}: GeneralInformationTabProps) {
  return (
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
            <p className="font-semibold">{workOrder.vehicle_plate || "N/A"}</p>
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
              <p className="font-semibold">{workOrder.correlative || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Apertura</p>
              <p className="font-semibold">
                {workOrder.opening_date
                  ? new Date(workOrder.opening_date).toLocaleDateString("es-PE")
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha Estimada de Entrega</p>
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
                  ? new Date(workOrder.actual_delivery_date).toLocaleDateString(
                      "es-PE"
                    )
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
              <p className="font-semibold">{workOrder.advisor_name || "N/A"}</p>
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
          <h3 className="text-lg font-semibold mb-4">Estado de Facturación</h3>
          <div className="flex items-center gap-3">
            <Badge variant={workOrder.is_invoiced ? "default" : "secondary"}>
              {workOrder.is_invoiced ? "Facturado" : "No Facturado"}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
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
  );
}
