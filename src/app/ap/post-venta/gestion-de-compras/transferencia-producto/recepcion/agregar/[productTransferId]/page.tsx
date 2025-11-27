"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";
import { TransferReceptionSchema } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.schema";
import { TransferReceptionForm } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/components/TransferReceptionForm";
import { useProductTransferById } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.hook";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { TRANSFER_RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.constants";
import { storeTransferReception } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.actions";

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
        `/ap/post-venta/gestion-de-compras/transferencia-producto/recepcion/${productTransferId}`
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
        title={`Nueva Recepción - Transferencia #${productTransfer.id}`}
        mode="create"
        icon="PackageCheck"
      />
      <TransferReceptionForm
        defaultValues={{
          product_transfer_id: productTransferId || "",
          reception_date: today,
          warehouse_id:
            productTransfer.warehouse_destination_id?.toString() || "",
          shipping_guide_number: "",
          notes: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() =>
          router(
            `/ap/post-venta/gestion-de-compras/transferencia-producto/recepcion/${productTransferId}`
          )
        }
        productTransferItems={productTransfer.details?.map((detail) => ({
          id: detail.id,
          product_id: detail.product_id,
          product_name: detail.product?.description,
          quantity: detail.quantity,
          unit_cost: detail.unit_cost,
        }))}
      />
    </FormWrapper>
  );
}
