"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscountRequestModal } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/components/DiscountRequestModal";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Percent, Tag, Trash2 } from "lucide-react";
import { useDiscountRequestsByQuotation } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.hook";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import { deleteDiscountRequestOrderQuotation } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.actions";
import {
  DISCOUNT_REQUEST_MESON,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { ITEM_TYPE_PRODUCT } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants";

export default function RequestDiscountOrderQuotationMesonPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;
  const router = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: quotation, isLoading } = useOrderQuotationById(Number(id));
  const { data: discountRequests = [], isLoading: isLoadingRequests } =
    useDiscountRequestsByQuotation(Number(id));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_GLOBAL);
  const [selectedDetail, setSelectedDetail] =
    useState<OrderQuotationDetailsResource | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestOrderQuotationResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteDiscountRequestOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud eliminada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al eliminar la solicitud";
      errorToast(message);
      setDeleteId(null);
    },
  });

  const handleOpenCreate = (
    type: "GLOBAL" | "PARTIAL",
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(null);
    setModalType(type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleOpenEdit = (
    request: DiscountRequestOrderQuotationResource,
    detail?: OrderQuotationDetailsResource,
  ) => {
    setEditingRequest(request);
    setModalType(request.type);
    setSelectedDetail(detail ?? null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedDetail(null);
    setEditingRequest(null);
  };

  if (isLoadingModule || isLoading || isLoadingRequests)
    return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!quotation) notFound();

  const productDetails = (quotation.details ?? []).filter(
    (d) => d.item_type === ITEM_TYPE_PRODUCT,
  );
  const hasMultipleItems = productDetails.length > 1;
  const currencySymbol = quotation.type_currency?.symbol ?? "S/.";
  const globalBaseAmount = productDetails.reduce(
    (sum, d) => sum + Number(d.total_amount || 0),
    0,
  );

  const globalRequest = discountRequests.find((r) => r.type === TYPE_GLOBAL);
  const hasPartialRequests = discountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );

  const getPartialRequest = (detailId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL && r.ap_order_quotation_detail_id === detailId,
    );

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const baseAmountForModal =
    modalType === TYPE_GLOBAL
      ? globalBaseAmount
      : Number(selectedDetail?.total_amount || 0);

  return (
    <FormWrapper>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TitleFormComponent
          title="Solicitar Descuento"
          mode="edit"
          icon={currentView.icon}
        />
        {hasMultipleItems && (
          <div className="w-full flex justify-end items-center gap-2 flex-wrap">
            {globalRequest ? (
              <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                <span className="text-muted-foreground text-xs">
                  Descuento global:
                </span>
                <span className="font-semibold">
                  {Number(globalRequest.requested_discount_percentage).toFixed(
                    2,
                  )}
                  %
                </span>
                <Badge color={globalRequest.is_approved ? "green" : "orange"}>
                  {globalRequest.is_approved ? "Aprobado" : "Pendiente"}
                </Badge>
                {!globalRequest.is_approved && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      tooltip="Editar solicitud global"
                      onClick={() => handleOpenEdit(globalRequest)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      tooltip="Eliminar solicitud global"
                      onClick={() => setDeleteId(globalRequest.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              !hasPartialRequests && (
                <Button
                  variant="default"
                  onClick={() => handleOpenCreate(TYPE_GLOBAL)}
                  className="gap-2"
                >
                  <Percent className="size-4" />
                  Descuento global
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {/* Info general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border p-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Número</p>
          <p className="font-semibold">{quotation.quotation_number}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Fecha</p>
          <p>{formatDate(quotation.quotation_date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Vencimiento</p>
          <p>{formatDate(quotation.expiration_date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Moneda</p>
          <p>{quotation.type_currency?.name ?? "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Cliente</p>
          <p>{quotation.client?.full_name ?? "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Placa</p>
          <p>{quotation.vehicle?.plate ?? "-"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Estado</p>
          <Badge color="indigo">{quotation.status}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Total</p>
          <p className="font-semibold">
            {currencySymbol} {Number(quotation.total_amount ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabla de ítems */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">
                #
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">
                Descripción
              </th>
              <th className="text-right px-4 py-2 font-medium text-xs text-muted-foreground">
                Cant.
              </th>
              <th className="text-right px-4 py-2 font-medium text-xs text-muted-foreground">
                P. Unit.
              </th>
              <th className="text-right px-4 py-2 font-medium text-xs text-muted-foreground">
                Desc. %
              </th>
              <th className="text-right px-4 py-2 font-medium text-xs text-muted-foreground">
                Total
              </th>
              {!globalRequest && (
                <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">
                  Desc. parcial
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {productDetails.map((detail, index) => {
              const partialRequest = getPartialRequest(detail.id);
              return (
                <tr key={detail.id} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium">{detail.description}</p>
                    {detail.observations && (
                      <p className="text-xs text-muted-foreground">
                        {detail.observations}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{detail.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {currencySymbol} {Number(detail.unit_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {Number(detail.discount_percentage).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {currencySymbol} {Number(detail.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {partialRequest ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">
                          {Number(
                            partialRequest.requested_discount_percentage,
                          ).toFixed(2)}
                          %
                        </span>
                        <Badge
                          color={
                            partialRequest.is_approved ? "green" : "orange"
                          }
                        >
                          {partialRequest.is_approved
                            ? "Aprobado"
                            : "Pendiente"}
                        </Badge>
                        {!partialRequest.is_approved && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              tooltip="Editar solicitud"
                              onClick={() =>
                                handleOpenEdit(partialRequest, detail)
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              tooltip="Eliminar solicitud"
                              onClick={() => setDeleteId(partialRequest.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      !globalRequest && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          tooltip="Solicitar descuento parcial"
                          onClick={() => handleOpenCreate(TYPE_PARTIAL, detail)}
                        >
                          <Tag className="size-4" />
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router(ABSOLUTE_ROUTE)}>
          Volver
        </Button>
      </div>

      <DiscountRequestModal
        open={modalOpen}
        onClose={handleClose}
        type={modalType}
        quotationId={Number(id)}
        baseAmount={baseAmountForModal}
        detail={selectedDetail ?? undefined}
        currencySymbol={currencySymbol}
        existingRequest={editingRequest ?? undefined}
        itemType="PRODUCT"
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={() => Promise.resolve(doDelete(deleteId))}
        />
      )}
    </FormWrapper>
  );
}
