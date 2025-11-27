"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";
import { useAllTransferReceptions } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.hook";
import TransferReceptionsTable from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/components/TransferReceptionsTable";
import TransferReceptionsCards from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/components/TransferReceptionsCards";
import { useParams, useNavigate } from "react-router-dom";
import { useProductTransferById } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.hook";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TRANSFER_RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.constants";
import { deleteTransferReception } from "@/features/ap/post-venta/gestion-compras/recepcion-transferencia/lib/transferReception.actions";

export default function TransferReceptionsPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE_ADD } = TRANSFER_RECEPTION;
  const permissions = useModulePermissions("transferencia-producto");
  const navigate = useNavigate();
  const { productTransferId } = useParams<{ productTransferId: string }>();
  const productTransferIdNum = productTransferId
    ? parseInt(productTransferId)
    : undefined;

  const { data: productTransfer, isLoading: isLoadingTransfer } =
    useProductTransferById(productTransferIdNum || 0);

  const { data, isLoading, refetch } = useAllTransferReceptions(
    {},
    productTransferIdNum
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransferReception(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleBack = () => {
    navigate("/ap/post-venta/gestion-de-compras/transferencia-producto");
  };

  const handleAddReception = () => {
    navigate(`${ROUTE_ADD}/${productTransferId}`);
  };

  if (isLoadingModule || isLoadingTransfer) return <PageSkeleton />;
  if (!checkRouteExists("transferencia-producto")) return <NotFound />;
  if (!productTransfer) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <TitleComponent
              title={`Recepciones - Transferencia #${productTransfer.id}`}
              subtitle="Gestión de recepciones de transferencias"
              icon="PackageCheck"
            />
          </div>
        </div>
        {permissions.canCreate && (
          <Button size="sm" variant="outline" onClick={handleAddReception}>
            <Plus className="size-4 mr-2" /> Agregar Recepción
          </Button>
        )}
      </HeaderTableWrapper>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Almacén Origen</p>
            <p className="font-semibold">
              {productTransfer.warehouse_origin?.description || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén Destino</p>
            <p className="font-semibold">
              {productTransfer.warehouse_destination?.description || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="font-semibold">
              {productTransfer.details?.length || 0}
            </p>
          </div>
        </div>
      </Card>

      <TransferReceptionsTable
        isLoading={isLoading}
        data={data!}
        customContent={
          <TransferReceptionsCards
            data={data!}
            onDelete={setDeleteId}
            permissions={{
              canUpdate: permissions.canUpdate,
              canDelete: permissions.canDelete,
            }}
            warehouseName={productTransfer?.warehouse_destination?.description}
          />
        }
      ></TransferReceptionsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
