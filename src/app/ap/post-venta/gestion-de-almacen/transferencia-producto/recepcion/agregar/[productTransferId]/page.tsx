"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import NotFound from "@/app/not-found.tsx";
import { TransferReceptionSchema } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.schema.ts";
import { TransferReceptionForm } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/components/TransferReceptionForm.tsx";
import { useProductTransferById } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.hook.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { TRANSFER_RECEPTION } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.constants.ts";
import { storeTransferReception } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.actions.ts";

export default function CreateTransferReceptionPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL } = TRANSFER_RECEPTION;
  const { productTransferId } = useParams<{ productTransferId: string }>();
  const productTransferIdNum = productTransferId
    ? parseInt(productTransferId)
    : undefined;

  const { data: productTransfer, isLoading: isLoadingTransfer } =
    useProductTransferById(productTransferIdNum || 0);

  const { mutate, isPending } = useMutation({
    mutationFn: storeTransferReception,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(
        `/ap/post-venta/gestion-de-almacen/transferencia-producto/recepcion/${productTransferId}`,
      );
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: TransferReceptionSchema) => {
    mutate(data);
  };

  if (isLoadingTransfer) return <PageSkeleton />;
  if (!checkRouteExists("transferencia-producto")) return <NotFound />;
  if (!currentView) return <NotFound />;
  if (!productTransfer) return <NotFound />;

  const today = new Date();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Nueva Recepción - Transferencia ${productTransfer.movement_number}`}
        mode="create"
        icon="PackageCheck"
      />
      <TransferReceptionForm
        defaultValues={{
          transfer_movement_id: productTransferId || "",
          reception_date: today,
          warehouse_id:
            productTransfer.warehouse_destination_id?.toString() || "",
          notes: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() =>
          router(
            `/ap/post-venta/gestion-de-almacen/transferencia-producto/recepcion/${productTransferId}`,
          )
        }
        itemType={productTransfer.item_type as "PRODUCTO" | "SERVICIO"}
        productTransferItems={productTransfer.details?.map((detail) => ({
          id: detail.id,
          product_id: detail.product_id,
          product_name: detail.product?.name,
          notes: detail.notes,
          quantity: Number(detail.quantity),
          unit_cost: detail.unit_cost,
        }))}
      />
    </FormWrapper>
  );
}
