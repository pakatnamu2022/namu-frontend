"use client";

import { useNavigate } from "react-router-dom";
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
import FormWrapper from "@/shared/components/FormWrapper";
import { VEHICLE_PURCHASE_ORDER } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { storeVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";
import { VehiclePurchaseOrderSchema } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.schema";
import { VehiclePurchaseOrderForm } from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderForm";
import { format } from "date-fns";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddVehiclePurchaseOrderPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = VEHICLE_PURCHASE_ORDER;

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
      // Convertir los items
      items: data.items.map((item, index) => ({
        ...item,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        unit_measurement_id: Number(item.unit_measurement_id),
        // El primer item es el vehículo si isVehiclePurchase es true
        is_vehicle: index === 0,
      })),
    });
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <VehiclePurchaseOrderForm
        defaultValues={{
          vin: "",
          year: currentYear(),
          engine_number: "",
          ap_brand_id: "",
          ap_models_vn_id: "",
          vehicle_color_id: "",
          supplier_order_type_id: "",
          engine_type_id: "",
          sede_id: "",
          invoice_series: "",
          invoice_number: "",
          emission_date: new Date(),
          subtotal: 0,
          igv: 0,
          total: 0,
          supplier_id: "",
          currency_id: "",
          warehouse_id: "",
          items: [],
          discount: 0,
          isc: 0,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        isVehiclePurchase={true}
      />
    </FormWrapper>
  );
}
