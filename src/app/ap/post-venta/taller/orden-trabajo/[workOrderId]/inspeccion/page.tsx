"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { VEHICLE_INSPECTION } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.constants";
import { storeVehicleInspection } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.actions";
import { VehicleInspectionSchema } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/lib/vehicleInspection.schema";
import { VehicleInspectionForm } from "@/features/ap/post-venta/taller/inspeccion-vehiculo/components/VehicleInspectionForm";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { useFindWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.hook";
import { Card } from "@/components/ui/card";
import { Car } from "lucide-react";

export default function VehicleInspectionPage() {
  const { workOrderId } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { QUERY_KEY, MODEL } = VEHICLE_INSPECTION;
  const { ABSOLUTE_ROUTE } = WORKER_ORDER;

  // Obtener información de la orden de trabajo
  const { data: workOrder, isLoading: isLoadingWorkOrder } =
    useFindWorkOrderById(Number(workOrderId));

  // Mutation para crear
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: storeVehicleInspection,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: VehicleInspectionSchema) => {
    // Crear FormData con todos los datos y archivos
    const formData = new FormData();

    // Agregar campos básicos
    formData.append("work_order_id", data.work_order_id);
    formData.append("dirty_unit", data.dirty_unit ? "1" : "0");
    formData.append("unit_ok", data.unit_ok ? "1" : "0");
    formData.append("title_deed", data.title_deed ? "1" : "0");
    formData.append("soat", data.soat ? "1" : "0");
    formData.append("moon_permits", data.moon_permits ? "1" : "0");
    formData.append("service_card", data.service_card ? "1" : "0");
    formData.append("owner_manual", data.owner_manual ? "1" : "0");
    formData.append("key_ring", data.key_ring ? "1" : "0");
    formData.append("wheel_lock", data.wheel_lock ? "1" : "0");
    formData.append("safe_glasses", data.safe_glasses ? "1" : "0");
    formData.append("radio_mask", data.radio_mask ? "1" : "0");
    formData.append("lighter", data.lighter ? "1" : "0");
    formData.append("floors", data.floors ? "1" : "0");
    formData.append("seat_cover", data.seat_cover ? "1" : "0");
    formData.append("quills", data.quills ? "1" : "0");
    formData.append("antenna", data.antenna ? "1" : "0");
    formData.append("glasses_wheel", data.glasses_wheel ? "1" : "0");
    formData.append("emblems", data.emblems ? "1" : "0");
    formData.append("spare_tire", data.spare_tire ? "1" : "0");
    formData.append("fluid_caps", data.fluid_caps ? "1" : "0");
    formData.append("tool_kit", data.tool_kit ? "1" : "0");
    formData.append("jack_and_lever", data.jack_and_lever ? "1" : "0");
    formData.append("general_observations", data.general_observations || "");
    formData.append(
      "inspection_date",
      data.inspection_date instanceof Date
        ? data.inspection_date.toISOString()
        : ""
    );
    formData.append("fuel_level", data.fuel_level);
    formData.append("oil_level", data.oil_level);
    formData.append("mileage", data.mileage);
    formData.append("customer_signature", data.customer_signature);

    // Agregar daños y sus fotos
    if (data.damages && data.damages.length > 0) {
      data.damages.forEach((damage, index) => {
        formData.append(`damages[${index}][damage_type]`, damage.damage_type);
        if (damage.x_coordinate !== undefined) {
          formData.append(
            `damages[${index}][x_coordinate]`,
            String(damage.x_coordinate)
          );
        }
        if (damage.y_coordinate !== undefined) {
          formData.append(
            `damages[${index}][y_coordinate]`,
            String(damage.y_coordinate)
          );
        }
        if (damage.description) {
          formData.append(`damages[${index}][description]`, damage.description);
        }
        // Agregar archivo de foto si existe
        if (damage.photo_file) {
          formData.append(`damages[${index}][photo]`, damage.photo_file);
        }
      });
    }

    create(formData as any);
  };

  if (isLoadingWorkOrder) {
    return <FormSkeleton />;
  }

  if (!workOrder) {
    notFound();
    return null;
  }

  const getCurrentDate = () => {
    return new Date();
  };

  const defaultValues: Partial<VehicleInspectionSchema> = {
    work_order_id: String(workOrder.id),
    dirty_unit: false,
    unit_ok: false,
    title_deed: false,
    soat: false,
    moon_permits: false,
    service_card: false,
    owner_manual: false,
    key_ring: false,
    wheel_lock: false,
    safe_glasses: false,
    radio_mask: false,
    lighter: false,
    floors: false,
    seat_cover: false,
    quills: false,
    antenna: false,
    glasses_wheel: false,
    emblems: false,
    spare_tire: false,
    fluid_caps: false,
    tool_kit: false,
    jack_and_lever: false,
    general_observations: "",
    inspection_date: getCurrentDate(),
    fuel_level: workOrder.fuel_level || "",
    oil_level: "",
    mileage: workOrder.mileage ? String(workOrder.mileage) : "",
    damages: [],
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Inspección de Vehículo - ${workOrder.correlative}`}
        mode="create"
        icon="ClipboardCheck"
      />

      {/* Información de la Orden de Trabajo */}
      <Card className="p-4 mb-6 gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Car className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-gray-800">
            Información de la Orden de Trabajo
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Correlativo</p>
            <p className="font-semibold text-sm">{workOrder.correlative}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Placa</p>
            <p className="font-semibold text-sm">
              {workOrder.vehicle_plate || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">VIN</p>
            <p className="font-semibold text-sm">
              {workOrder.vehicle_vin || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Kilometraje</p>
            <p className="font-semibold text-sm">
              {workOrder.mileage ? `${workOrder.mileage} km` : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      <VehicleInspectionForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
