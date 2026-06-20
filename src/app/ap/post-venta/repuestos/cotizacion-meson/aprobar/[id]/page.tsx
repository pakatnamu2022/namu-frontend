"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2, Loader2 } from "lucide-react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/core/core.function";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import {
  findOrderQuotationById,
  approveOrderQuotationMeson,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface";
import { getAllOrderQuotationDetails } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.actions";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import { ITEM_TYPE_PRODUCT } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants";
import { CopyCell } from "@/shared/components/CopyCell";
import {
  DetailSheetTable,
  type DetailSheetTableColumn,
} from "@/shared/components/DetailSheetTable";

export default function AprobacionProductosMesonPage() {
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

      const updated = await approveOrderQuotationMeson(quotationId, payload);
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
    (sum, d) => sum + (Number(d.net_amount) || 0),
    0,
  );

  const chiefApproved = !!quotation.chief_approval_by;
  const managerApproved = !!quotation.manager_approval_by;

  const columns: DetailSheetTableColumn<OrderQuotationDetailsResource>[] = [
    {
      header: "Repuesto",
      render: (detail) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {detail.description}
          </p>
          {detail.product?.code && (
            <CopyCell
              className="text-xs text-muted-foreground"
              value={detail.product.code}
              label={`Cód: ${detail.product.code}`}
            />
          )}
          {detail.observations && (
            <p className="text-xs text-gray-400 mt-0.5">
              {detail.observations}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Cant.",
      className: "text-center",
      render: (detail) => (
        <span className="text-sm">
          {detail.quantity}{" "}
          <span className="text-xs text-gray-400">{detail.unit_measure}</span>
        </span>
      ),
    },
    {
      header: "Tip. Abas.",
      className: "text-center",
      render: (detail) => (
        <span className="text-sm text-muted-foreground">
          {detail.supply_type}
        </span>
      ),
    },
    {
      header: "P. Unit.",
      className: "text-center",
      render: (detail) => (
        <span className="text-sm">{formatCurrency(detail.unit_price)}</span>
      ),
    },
    {
      header: "Desc.",
      className: "text-center",
      render: (detail) =>
        Number(detail.discount_percentage) > 0 ? (
          <span className="text-sm font-medium text-orange-600">
            -{detail.discount_percentage}%
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      header: "Cto. Total",
      className: "text-right",
      render: (detail) => (
        <span className="text-sm font-semibold text-primary">
          {formatCurrency(detail.total_cost)}
        </span>
      ),
    },
    {
      header: "Cto. Neto",
      className: "text-right",
      render: (detail) => (
        <span className="text-sm font-bold text-primary">
          {formatCurrency(detail.net_amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(ORDER_QUOTATION_MESON.ABSOLUTE_ROUTE)}
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
          <CopyCell
            className="text-sm font-bold text-gray-900"
            value={quotation.quotation_number}
          />
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

      {/* Detalle de Repuestos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Detalle de Repuestos</h3>
        </div>

        <DetailSheetTable
          rows={productDetails}
          columns={columns}
          getKey={(detail) => detail.id}
          emptyMessage="No hay repuestos en esta cotización"
          footer={
            productDetails.length > 0 ? (
              <div className="flex justify-end px-4 py-2 border-x border-b rounded-b-md bg-gray-50 text-sm">
                <span className="text-gray-600 mr-3">Total:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(totalProducts)}
                </span>
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Aprobaciones */}
      <div className="flex justify-end">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Jefe */}
          <div
            className={`rounded-lg border px-5 py-3 min-w-[160px] ${
              chiefApproved
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Aprobación Jefe
            </p>
            {chiefApproved ? (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm font-semibold text-green-700">
                    Aprobado
                  </span>
                </div>
                {quotation.chief_approval_by_name && (
                  <span className="text-[11px] text-green-600/80 pl-0.5 truncate">
                    {quotation.chief_approval_by_name}
                  </span>
                )}
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                className="w-full h-7 text-xs"
                disabled={isApproving}
                onClick={() => setConfirmChief(true)}
              >
                {isApproving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Aprobar"
                )}
              </Button>
            )}
          </div>

          {/* Gerente */}
          <div
            className={`rounded-lg border px-5 py-3 min-w-[160px] ${
              managerApproved
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Aprobación Gerente
            </p>
            {managerApproved ? (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm font-semibold text-green-700">
                    Aprobado
                  </span>
                </div>
                {quotation.manager_approval_by_name && (
                  <span className="text-[11px] text-green-600/80 pl-0.5 truncate">
                    {quotation.manager_approval_by_name}
                  </span>
                )}
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                className="w-full h-7 text-xs"
                disabled={isApproving}
                onClick={() => setConfirmManager(true)}
              >
                {isApproving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Aprobar"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

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
