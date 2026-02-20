"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  currentYear,
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { VEHICLE_PURCHASE_ORDER } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { storeVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";
import { VehiclePurchaseOrderSchema } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.schema";
import { VehiclePurchaseOrderForm } from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderForm";
import { format } from "date-fns";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";
import { useControlUnitsById } from "@/features/ap/comercial/control-unidades/lib/controlUnits.hook";
import { UNIT_MEASUREMENT_ID } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";

export default function AddVehiclePurchaseOrderPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const consignmentId = searchParams.get("consignment_id");
  const consignmentShippingGuideId = consignmentId
    ? Number(consignmentId)
    : undefined;
  const isConsignmentOrder = !!consignmentShippingGuideId;
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = VEHICLE_PURCHASE_ORDER;

  // Fetch consignment data to pre-populate vehicle item
  const { data: consignmentData, isLoading: isLoadingConsignment } =
    useControlUnitsById(consignmentShippingGuideId || 0);

  const { mutate, isPending } = useMutation({
    mutationFn: storeVehiclePurchaseOrder,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: VehiclePurchaseOrderSchema): void => {
    mutate({
      ...data,
      emission_date: format(data.emission_date, "yyyy-MM-dd"),
      due_date: data.due_date ? format(data.due_date, "yyyy-MM-dd") : undefined,
      year: Number(data.year),
      subtotal: Number(data.subtotal),
      igv: Number(data.igv),
      total: Number(data.total),
      discount: data.discount ? Number(data.discount) : undefined,
      isc: data.isc ? Number(data.isc) : undefined,
      ...(consignmentShippingGuideId && {
        consignment_shipping_guide_id: consignmentShippingGuideId,
      }),
      // Convertir los items
      items: data.items.map((item, index) => ({
        ...item,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        unit_measurement_id: Number(item.unit_measurement_id),
        is_vehicle: !isConsignmentOrder && index === 0,
      })),
    });
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  // Esperar datos de consignación antes de renderizar el form
  if (isConsignmentOrder && isLoadingConsignment) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  // Datos del vehículo de la guía de consignación
  const vehicle = consignmentData?.vehicle;

  // Pre-poblar el item del vehículo desde la guía de consignación
  const consignmentVehicleItem =
    isConsignmentOrder && consignmentData?.items?.[0]
      ? {
          unit_measurement_id: UNIT_MEASUREMENT_ID.UNIDAD.toString(),
          description: `${consignmentData.items[0].codigo} - ${consignmentData.items[0].descripcion}`,
          unit_price: 0,
          quantity: 1,
          is_vehicle: false,
        }
      : null;

  return (
    <PageWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <VehiclePurchaseOrderForm
        defaultValues={{
          // Campos del vehículo: se pre-llenan desde el shipping guide si es consignación
          vin: vehicle?.vin ?? "",
          year: vehicle?.year ?? currentYear(),
          engine_number: vehicle?.engine_number ?? "",
          ap_brand_id: vehicle?.model?.brand_id
            ? vehicle.model.brand_id.toString()
            : "",
          ap_models_vn_id: vehicle?.ap_models_vn_id
            ? vehicle.ap_models_vn_id.toString()
            : "",
          vehicle_color_id: vehicle?.vehicle_color_id
            ? vehicle.vehicle_color_id.toString()
            : "",
          supplier_order_type_id: isConsignmentOrder ? "641" : "",
          engine_type_id: vehicle?.engine_type_id
            ? vehicle.engine_type_id.toString()
            : "",
          sede_id: consignmentData?.sede_receiver_id
            ? String(consignmentData.sede_receiver_id)
            : "",
          invoice_series: "",
          invoice_number: "",
          emission_date: new Date(),
          subtotal: 0,
          igv: 0,
          total: 0,
          supplier_id: "",
          currency_id: "",
          warehouse_id: "",
          items: consignmentVehicleItem ? [consignmentVehicleItem] : [],
          discount: 0,
          isc: 0,
          // eslint-disable-next-line react-hooks/purity
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        isVehiclePurchase={!isConsignmentOrder}
        consignmentShippingGuideId={consignmentShippingGuideId}
      />
    </PageWrapper>
  );
}
