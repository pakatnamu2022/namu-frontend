"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { VEHICLE_PURCHASE_ORDER } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import {
  findVehiclePurchaseOrderById,
  resendVehiclePurchaseOrder,
} from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";
import { VehiclePurchaseOrderSchema } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.schema";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface";
import { VehiclePurchaseOrderForm } from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderForm";
import { format, parse } from "date-fns";
import { useEffect } from "react";
import { notFound } from "@/shared/hooks/useNotFound";
import PageWrapper from "@/shared/components/PageWrapper";

export default function ResendVehiclePurchaseOrderPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = VEHICLE_PURCHASE_ORDER;

  const { data: vehiclePurchaseOrder, isLoading: loadingVehiclePurchaseOrder } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findVehiclePurchaseOrderById(Number(id)),
      refetchOnWindowFocus: false,
    });

  // Check if the purchase order can be resent
  const canResend =
    vehiclePurchaseOrder &&
    !vehiclePurchaseOrder.status &&
    vehiclePurchaseOrder.credit_note_dynamics &&
    vehiclePurchaseOrder.migration_status === "updated_with_nc" &&
    vehiclePurchaseOrder.resent === false;

  // Redirect if cannot resend (using useEffect to avoid setState during render)
  useEffect(() => {
    if (!loadingVehiclePurchaseOrder && vehiclePurchaseOrder && !canResend) {
      errorToast(
        "Esta orden de compra no cumple con los requisitos para ser reenviada"
      );
      router(ABSOLUTE_ROUTE);
    }
  }, [loadingVehiclePurchaseOrder, vehiclePurchaseOrder, canResend, router]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => resendVehiclePurchaseOrder(Number(id), data),
    onSuccess: async () => {
      successToast("Orden de Compra reenviada exitosamente");
      router(ABSOLUTE_ROUTE);
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
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

  function mapVehiclePurchaseOrderToForm(
    data: VehiclePurchaseOrderResource
  ): Partial<VehiclePurchaseOrderSchema> {
    return {
      // Vehicle - Los datos vienen dentro del objeto vehicle
      vin: data.vehicle?.vin || "",
      year: data.vehicle?.year || undefined,
      engine_number: data.vehicle?.engine_number || "",
      vehicle_unit_price: data.items?.[0]?.unit_price
        ? Number(data.items[0].unit_price)
        : 0,
      ap_brand_id: data.vehicle?.model.brand_id
        ? String(data.vehicle.model.brand_id)
        : "",
      ap_models_vn_id: data.vehicle?.ap_models_vn_id
        ? String(data.vehicle.ap_models_vn_id)
        : "",
      vehicle_color_id: data.vehicle?.vehicle_color_id
        ? String(data.vehicle.vehicle_color_id)
        : "",
      engine_type_id: data.vehicle?.engine_type_id
        ? String(data.vehicle.engine_type_id)
        : "",
      sede_id: data.sede_id ? String(data.sede_id) : "",
      supplier_order_type_id: data?.supplier_order_type_id
        ? String(data.supplier_order_type_id)
        : "",
      // Invoice
      invoice_series: data.invoice_series || "",
      invoice_number: data.invoice_number || "",
      emission_date: parse(data.emission_date, "yyyy-MM-dd", new Date()),
      due_date: data.due_date
        ? parse(data.due_date, "yyyy-MM-dd", new Date())
        : undefined,
      subtotal: Number(data.subtotal) || 0,
      igv: Number(data.igv) || 0,
      total: Number(data.total) || 0,
      discount: data.discount ? Number(data.discount) : 0,
      isc: data.isc ? Number(data.isc) : 0,
      supplier_id: data.supplier_id ? String(data.supplier_id) : "",
      currency_id: data.currency_id ? String(data.currency_id) : "",
      // Warehouse
      warehouse_id: data.warehouse_id ? String(data.warehouse_id) : "",
      // Items
      items:
        data.items?.map((item) => ({
          unit_measurement_id: item.unit_measurement?.id
            ? String(item.unit_measurement.id)
            : "",
          description: item.description || "",
          unit_price: Number(item.unit_price) || 0,
          quantity: item.quantity || 1,
          is_vehicle: item.is_vehicle || false,
        })) || [],
    };
  }

  const isLoadingAny = loadingVehiclePurchaseOrder || !vehiclePurchaseOrder;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  // If cannot resend, show skeleton while redirect happens
  if (!canResend) {
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent
        title="Reenviar Orden de Compra de Vehículo"
        mode="edit"
        icon={currentView.icon}
      />
      <VehiclePurchaseOrderForm
        defaultValues={mapVehiclePurchaseOrderToForm(vehiclePurchaseOrder)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="resend"
        isVehiclePurchase={true}
      />
    </PageWrapper>
  );
}
