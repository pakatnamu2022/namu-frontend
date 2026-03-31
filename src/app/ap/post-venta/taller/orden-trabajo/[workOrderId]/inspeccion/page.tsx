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
import { DataCard } from "@/components/DataCard";
import { Car, FileText, Gauge, User, Wrench } from "lucide-react";
import { format } from "date-fns";

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
    formData.append("ap_work_order_id", data.ap_work_order_id);
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
    // Detalles de trabajo
    formData.append("oil_change", data.oil_change ? "1" : "0");
    formData.append("check_level_lights", data.check_level_lights ? "1" : "0");
    formData.append(
      "general_lubrication",
      data.general_lubrication ? "1" : "0",
    );
    formData.append(
      "rotation_inspection_cleaning",
      data.rotation_inspection_cleaning ? "1" : "0",
    );
    formData.append(
      "insp_filter_basic_checks",
      data.insp_filter_basic_checks ? "1" : "0",
    );
    formData.append(
      "tire_pressure_inflation_check",
      data.tire_pressure_inflation_check ? "1" : "0",
    );
    formData.append(
      "alignment_balancing",
      data.alignment_balancing ? "1" : "0",
    );
    formData.append(
      "pad_replace_disc_resurface",
      data.pad_replace_disc_resurface ? "1" : "0",
    );
    formData.append("other_work_details", data.other_work_details || "");
    // Requerimiento del cliente
    formData.append("customer_requirement", data.customer_requirement || "");
    // Explicación de resultados
    formData.append(
      "explanation_work_performed",
      data.explanation_work_performed ? "1" : "0",
    );
    formData.append("price_explanation", data.price_explanation ? "1" : "0");
    formData.append(
      "confirm_additional_work",
      data.confirm_additional_work ? "1" : "0",
    );
    formData.append(
      "clarification_customer_concerns",
      data.clarification_customer_concerns ? "1" : "0",
    );
    formData.append("exterior_cleaning", data.exterior_cleaning ? "1" : "0");
    formData.append("interior_cleaning", data.interior_cleaning ? "1" : "0");
    formData.append("keeps_spare_parts", data.keeps_spare_parts ? "1" : "0");
    formData.append("valuable_objects", data.valuable_objects ? "1" : "0");
    // Items de cortesía
    formData.append(
      "courtesy_seat_cover",
      data.courtesy_seat_cover ? "1" : "0",
    );
    formData.append("paper_floor", data.paper_floor ? "1" : "0");
    formData.append("general_observations", data.general_observations || "");
    formData.append("washed", data.washed ? "1" : "0");
    //photos front, back, left, right
    if (data.photo_front) {
      formData.append("photo_front", data.photo_front);
    }
    if (data.photo_back) {
      formData.append("photo_back", data.photo_back);
    }
    if (data.photo_left) {
      formData.append("photo_left", data.photo_left);
    }
    if (data.photo_right) {
      formData.append("photo_right", data.photo_right);
    }
    if (data.photo_optional_1) {
      formData.append("photo_optional_1", data.photo_optional_1);
    }
    if (data.photo_optional_2) {
      formData.append("photo_optional_2", data.photo_optional_2);
    }

    // Daños y otros campos
    formData.append(
      "inspection_date",
      data.inspection_date
        ? format(new Date(data.inspection_date), "yyyy-MM-dd HH:mm:ss")
        : "",
    );
    formData.append("fuel_level", data.fuel_level);
    formData.append("oil_level", data.oil_level);
    formData.append("mileage", String(data.mileage));
    formData.append("customer_signature", data.customer_signature);
    formData.append("signer_type", data.signer_type ?? "OWNER");

    // Agregar daños y sus fotos
    if (data.damages && data.damages.length > 0) {
      data.damages.forEach((damage, index) => {
        formData.append(`damages[${index}][damage_type]`, damage.damage_type);
        if (damage.x_coordinate !== undefined) {
          formData.append(
            `damages[${index}][x_coordinate]`,
            String(damage.x_coordinate),
          );
        }
        if (damage.y_coordinate !== undefined) {
          formData.append(
            `damages[${index}][y_coordinate]`,
            String(damage.y_coordinate),
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
    ap_work_order_id: String(workOrder.id),
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
    oil_change: false,
    check_level_lights: false,
    general_lubrication: false,
    rotation_inspection_cleaning: false,
    insp_filter_basic_checks: false,
    tire_pressure_inflation_check: false,
    alignment_balancing: false,
    pad_replace_disc_resurface: false,
    other_work_details: "",
    customer_requirement: "",
    explanation_work_performed: false,
    price_explanation: false,
    confirm_additional_work: false,
    clarification_customer_concerns: false,
    exterior_cleaning: false,
    interior_cleaning: false,
    keeps_spare_parts: false,
    valuable_objects: false,
    courtesy_seat_cover: false,
    paper_floor: false,
    washed: false,
    general_observations: "",
    inspection_date: String(getCurrentDate()),
    fuel_level: workOrder.fuel_level || "",
    oil_level: "",
    mileage: workOrder.mileage ? Number(workOrder.mileage) : undefined,
    damages: [],
    signer_type: "OWNER",
  };

  const workOrderSections = (workOrder.items || []).map((item, index) => ({
    key: `work-item-${item.id ?? index}`,
    title: `Trabajo`,
    icon: Wrench,
    columns: 3 as const,
    fields: [
      {
        key: `planning-${item.id ?? index}`,
        label: "Planificación",
        icon: Wrench,
        value: item.type_planning.description || "—",
      },
      {
        key: `operation-${item.id ?? index}`,
        label: "Operación",
        icon: Wrench,
        value: item.type_operation_name || "—",
      },
      ...(item.description
        ? [
            {
              key: `description-${item.id ?? index}`,
              label: "Detalle",
              icon: FileText,
              value: item.description,
            },
          ]
        : []),
    ],
  }));

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Recepción de Vehículo - ${workOrder.correlative}`}
        mode="create"
        icon="ClipboardCheck"
      />

      {/* Información de la Orden de Trabajo */}
      <div className="mb-6">
        <DataCard
          title="INFORMACIÓN DE LA ORDEN DE TRABAJO"
          columns={4}
          fields={[
            {
              key: "correlative",
              label: "Correlativo",
              icon: Car,
              value: workOrder.correlative || "—",
            },
            {
              key: "plate",
              label: "Placa",
              icon: Car,
              value: workOrder.vehicle_plate || "—",
            },
            {
              key: "vin",
              label: "VIN",
              icon: FileText,
              value: workOrder.vehicle_vin || "—",
            },
            {
              key: "mileage",
              label: "Kilometraje",
              icon: Gauge,
              value: workOrder.mileage ? `${workOrder.mileage} km` : "—",
            },
            {
              key: "owner_name",
              label: "Propietario",
              icon: User,
              value: workOrder.vehicle.owner!.full_name || "N/A",
            },
            {
              key: "full_contact_name",
              label: "Contacto",
              icon: User,
              value: workOrder.full_contact_name || "N/A",
            },
          ]}
          sections={workOrderSections}
        />
      </div>

      <VehicleInspectionForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
        dateOrderWork={
          workOrder.opening_date ? new Date(workOrder.opening_date) : undefined
        }
        ownerName={workOrder.vehicle.owner?.full_name}
        contactName={workOrder.full_contact_name}
        ownerDocumentTypeId={String(workOrder.vehicle.owner?.document_type_id)}
      />
    </FormWrapper>
  );
}
