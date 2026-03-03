"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { errorToast, successToast } from "@/core/core.function.ts";
import { ORDER_QUOTATION_TALLER } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";
import {
  findOrderQuotationById,
  approveOrderQuotation,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions.ts";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface.ts";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface.ts";
import { getAllOrderQuotationDetails } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.actions.ts";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog.tsx";
import { ITEM_TYPE_PRODUCT } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants";

export default function AprobacionProductosPage() {
  const params = useParams();
  const navigate = useNavigate();
  const quotationId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [quotation, setQuotation] = useState<OrderQuotationResource | null>(
    null,
  );
  const [productDetails, setProductDetails] = useState<
    OrderQuotationDetailsResource[]
  >([]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [confirmChief, setConfirmChief] = useState(false);
  const [confirmManager, setConfirmManager] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [quotationData, detailsData] = await Promise.all([
        findOrderQuotationById(quotationId),
        getAllOrderQuotationDetails({
          params: { order_quotation_id: quotationId },
        }),
      ]);
      setQuotation(quotationData);
      setProductDetails(
        detailsData.filter((d) => d.item_type === ITEM_TYPE_PRODUCT),
      );
    } catch {
      errorToast("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (type: "chief" | "manager") => {
    try {
      setIsApproving(true);
      const payload =
        type === "chief"
          ? { chief_approval_by: "Aprobado" }
          : { manager_approval_by: "Aprobado" };

      const updated = await approveOrderQuotation(quotationId, payload);
      setQuotation(updated);
      successToast(
        type === "chief"
          ? "Aprobación por Jefe registrada correctamente"
          : "Aprobación por Gerente registrada correctamente",
      );
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al registrar la aprobación");
    } finally {
      setIsApproving(false);
      setConfirmChief(false);
      setConfirmManager(false);
    }
  };

  const handleCopyCode = async (
    code: string,
    field: string,
    index?: number,
  ) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedField(field);
      if (index !== undefined) setCopiedIndex(index);
      setTimeout(() => {
        setCopiedField(null);
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = quotation?.type_currency?.symbol || "S/.";
    return `${symbol} ${Number(amount || 0).toFixed(2)}`;
  };

  if (isLoading) return <PageSkeleton />;

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cotización no encontrada</p>
      </div>
    );
  }

  const totalProducts = productDetails.reduce(
    (sum, d) => sum + (Number(d.total_amount) || 0),
    0,
  );

  const chiefApproved = !!quotation.chief_approval_by;
  const managerApproved = !!quotation.manager_approval_by;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(ORDER_QUOTATION_TALLER.ABSOLUTE_ROUTE)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Aprobación de Solicitud de Compra"
          subtitle={`Cotización: ${quotation.quotation_number}`}
        />
      </div>

      {/* Resumen de cotización */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-200 border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="flex flex-col gap-0.5 px-5 py-3">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Cotización
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900">
              {quotation.quotation_number}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              onClick={() =>
                handleCopyCode(quotation.quotation_number, "quotation_number")
              }
            >
              {copiedField === "quotation_number" ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 px-5 py-3">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Cliente
          </span>
          <span className="text-sm font-semibold text-gray-900 truncate">
            {quotation.client?.full_name || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 px-5 py-3">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Vehículo
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {quotation.vehicle?.plate || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 px-5 py-3">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Moneda
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {quotation.type_currency?.name || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 px-5 py-3 bg-gray-50">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
            Total Repuestos
          </span>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(totalProducts)}
          </span>
        </div>
      </div>

      {/* Tabla de productos a aprobar */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Detalle de Repuestos</h3>
          <Badge color="secondary" className="ml-auto font-semibold">
            {productDetails.length} item(s)
          </Badge>
        </div>

        {productDetails.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              No hay repuestos en esta cotización
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Cabecera */}
            <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b">
              <div className="col-span-4">Repuesto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-1 text-center">Tipo Abas.</div>
              <div className="col-span-2 text-center">Precio Unit.</div>
              <div className="col-span-1 text-center">Desc.</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Filas */}
            <div className="divide-y">
              {productDetails.map((detail, index) => (
                <div key={detail.id}>
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center">
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-gray-900">
                        {detail.description}
                      </p>
                      {detail.observations && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {detail.observations}
                        </p>
                      )}
                      {detail.product?.code && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {detail.product.code}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-slate-200"
                            onClick={() =>
                              handleCopyCode(
                                detail.product!.code,
                                "product_code",
                                index,
                              )
                            }
                          >
                            {copiedIndex === index &&
                            copiedField === "product_code" ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-sm">
                      {detail.quantity}{" "}
                      <span className="text-xs text-gray-500">
                        {detail.unit_measure}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-sm">
                      {detail.supply_type}
                    </div>
                    <div className="col-span-2 text-center text-sm">
                      {formatCurrency(detail.unit_price)}
                    </div>
                    <div className="col-span-1 text-center text-sm">
                      {Number(detail.discount_percentage) > 0 ? (
                        <span className="text-orange-600 font-medium">
                          -{detail.discount_percentage}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right text-sm font-bold text-primary">
                      {formatCurrency(detail.total_amount)}
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {detail.product?.code && (
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {detail.product.code}
                        </span>
                      )}
                      {detail.product?.code && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-slate-200"
                          onClick={() =>
                            handleCopyCode(
                              detail.product!.code,
                              "product_code_mobile",
                              index,
                            )
                          }
                        >
                          {copiedIndex === index &&
                          copiedField === "product_code_mobile" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {detail.description}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-gray-500">
                        Cantidad:{" "}
                        <span className="font-medium text-gray-900">
                          {detail.quantity} {detail.unit_measure}
                        </span>
                      </span>
                      <span className="text-gray-500 text-right">
                        Tipo:{" "}
                        <span className="font-medium text-gray-900">
                          {detail.supply_type}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Precio Unit.:{" "}
                        <span className="font-medium text-gray-900">
                          {formatCurrency(detail.unit_price)}
                        </span>
                      </span>
                      <span className="text-gray-500 text-right">
                        Desc.:{" "}
                        {Number(detail.discount_percentage) > 0 ? (
                          <span className="font-medium text-orange-600">
                            -{detail.discount_percentage}%
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900">—</span>
                        )}
                      </span>
                      <span className="text-gray-500 col-span-2 text-right">
                        Total:{" "}
                        <span className="font-bold text-primary">
                          {formatCurrency(detail.total_amount)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fila de total */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-t">
              <div className="col-span-10 text-sm font-semibold text-gray-700 text-right">
                Total:
              </div>
              <div className="col-span-2 text-right text-sm font-bold text-primary">
                {formatCurrency(totalProducts)}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Sección de aprobaciones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aprobaciones</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aprobación por Jefe */}
          <div
            className={`border rounded-lg p-4 ${chiefApproved ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Aprobar por Jefe
              </h4>
              {chiefApproved && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aprobado
                </Badge>
              )}
            </div>

            {chiefApproved ? (
              <p className="text-xs text-green-700">
                La aprobación del Jefe ha sido registrada exitosamente.
              </p>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={isApproving}
                onClick={() => setConfirmChief(true)}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Aprobar"
                )}
              </Button>
            )}
          </div>

          {/* Aprobación por Gerente */}
          <div
            className={`border rounded-lg p-4 ${managerApproved ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Aprobar por Gerente
              </h4>
              {managerApproved && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aprobado
                </Badge>
              )}
            </div>

            {managerApproved ? (
              <p className="text-xs text-green-700">
                La aprobación del Gerente ha sido registrada exitosamente.
              </p>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={isApproving}
                onClick={() => setConfirmManager(true)}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Aprobar"
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Diálogo de confirmación — Jefe */}
      <SimpleConfirmDialog
        open={confirmChief}
        onOpenChange={setConfirmChief}
        onConfirm={() => handleApprove("chief")}
        title="¿Estás seguro?"
        description="Se registrará la aprobación por Jefe para esta solicitud de compra. Esta acción no puede deshacerse."
        confirmText="Sí, aprobar"
        icon="warning"
        isLoading={isApproving}
      />

      {/* Diálogo de confirmación — Gerente */}
      <SimpleConfirmDialog
        open={confirmManager}
        onOpenChange={setConfirmManager}
        onConfirm={() => handleApprove("manager")}
        title="¿Estás seguro?"
        description="Se registrará la aprobación por Gerente para esta solicitud de compra. Esta acción no puede deshacerse."
        confirmText="Sí, aprobar"
        icon="warning"
        isLoading={isApproving}
      />
    </div>
  );
}
