import GeneralSheet from "@/shared/components/GeneralSheet";
import { InfoSection } from "@/shared/components/InfoSection";
import {
  DetailSheetTable,
  type DetailSheetTableColumn,
} from "@/shared/components/DetailSheetTable";
import { DataCard } from "@/components/DataCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Loader2,
  Package,
  Copy,
  Check,
  Hash,
  Calendar,
  Car,
  Fingerprint,
  User,
  IdCard,
  Phone,
  DollarSign,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { findPurchaseRequestById } from "../lib/purchaseRequest.actions";
import type { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { PURCHASE_REQUEST_STATUS } from "../lib/purchaseRequest.constants";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDate } from "@/core/core.function";

interface PurchaseRequestDetailSheetProps {
  purchaseRequestId: number | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function PurchaseRequestDetailSheet({
  purchaseRequestId,
  open,
  onClose,
  onRefresh,
}: PurchaseRequestDetailSheetProps) {
  const { data: purchaseRequest, isLoading } = useQuery({
    queryKey: ["purchaseRequest", purchaseRequestId],
    queryFn: () => findPurchaseRequestById(purchaseRequestId!),
    enabled: open && purchaseRequestId !== null,
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de Solicitud de Compra"
      subtitle={
        purchaseRequest
          ? `Solicitud ${purchaseRequest.request_number}`
          : "Cargando..."
      }
      icon="ShoppingCart"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !purchaseRequest ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            No se pudo cargar la información de la solicitud
          </p>
        </div>
      ) : (
        <DetailSheetContent
          purchaseRequest={purchaseRequest}
          onRefresh={onRefresh}
        />
      )}
    </GeneralSheet>
  );
}

interface DetailSheetContentProps {
  purchaseRequest: PurchaseRequestResource;
  onRefresh?: () => void;
}

function DetailSheetContent({ purchaseRequest }: DetailSheetContentProps) {
  const details = purchaseRequest.details || [];
  const statusText =
    PURCHASE_REQUEST_STATUS[
      purchaseRequest.status as keyof typeof PURCHASE_REQUEST_STATUS
    ] || purchaseRequest.status;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyCode = async (
    code: string,
    field: string,
    index?: number,
  ) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedField(field);
      if (index !== undefined) {
        setCopiedIndex(index);
      }
      setTimeout(() => {
        setCopiedField(null);
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div className="space-y-6 px-6">
      {/* Información General */}
      <InfoSection
        title="Información General"
        fields={[
          {
            label: "Número de Solicitud",
            value: purchaseRequest.request_number,
          },
          {
            label: "Fecha Solicitada",
            value: purchaseRequest.requested_date
              ? formatDate(purchaseRequest.requested_date)
              : "N/A",
          },
          {
            label: "Solicitado Por",
            value: purchaseRequest.requested_by || "N/A",
          },
          {
            label: "Estado",
            value: (
              <Badge
                style={{
                  backgroundColor: purchaseRequest.status_color || "#6B7280",
                }}
              >
                {statusText}
              </Badge>
            ),
          },
          {
            label: "Almacén",
            value: purchaseRequest.warehouse.description || "N/A",
          },
          {
            label: "Fecha de Creación",
            value: purchaseRequest.created_at
              ? formatDate(purchaseRequest.created_at)
              : "N/A",
          },
          ...(purchaseRequest.observations
            ? [
                {
                  label: "Observaciones",
                  value: purchaseRequest.observations,
                  fullWidth: true,
                },
              ]
            : []),
        ]}
      />

      <Separator />

      {/* Información de la Cotización Asociada */}
      {purchaseRequest.ap_order_quotation && (
        <>
          <DataCard
            title="Cotización Asociada"
            columns={2}
            fields={[
              {
                key: "quotation_number",
                label: "Número de Cotización",
                icon: Hash,
                value: purchaseRequest.ap_order_quotation.quotation_number,
              },
              {
                key: "quotation_date",
                label: "Fecha Cotización",
                icon: Calendar,
                value: purchaseRequest.ap_order_quotation.quotation_date
                  ? formatDate(
                      purchaseRequest.ap_order_quotation.quotation_date,
                    )
                  : "N/A",
              },
              {
                key: "total_amount",
                label: "Total Cotización",
                icon: DollarSign,
                value: `${purchaseRequest.ap_order_quotation.type_currency?.symbol || "S/."} ${purchaseRequest.ap_order_quotation.total_amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
              },
              {
                key: "status",
                label: "Estado",
                icon: Activity,
                value: purchaseRequest.ap_order_quotation.status || "N/A",
              },
            ]}
            sections={
              purchaseRequest.ap_order_quotation.vehicle
                ? [
                    {
                      key: "vehicle",
                      title: "Vehículo",
                      icon: Car,
                      columns: 2,
                      fields: [
                        {
                          key: "plate",
                          label: "Placa",
                          icon: Car,
                          value:
                            purchaseRequest.ap_order_quotation.vehicle.plate,
                        },
                        {
                          key: "vin",
                          label: "VIN",
                          icon: Fingerprint,
                          value:
                            purchaseRequest.ap_order_quotation.vehicle.vin ||
                            "N/A",
                        },
                        ...(purchaseRequest.ap_order_quotation.vehicle.owner
                          ? [
                              {
                                key: "owner_name",
                                label: "Cliente",
                                icon: User,
                                value:
                                  purchaseRequest.ap_order_quotation.vehicle
                                    .owner.full_name,
                              },
                              {
                                key: "owner_doc",
                                label: "Documento",
                                icon: IdCard,
                                value:
                                  purchaseRequest.ap_order_quotation.vehicle
                                    .owner.num_doc || "N/A",
                              },
                              {
                                key: "owner_phone",
                                label: "Teléfono",
                                icon: Phone,
                                value:
                                  purchaseRequest.ap_order_quotation.vehicle
                                    .owner.phone || "N/A",
                              },
                            ]
                          : []),
                      ],
                    },
                  ]
                : []
            }
          />
          <Separator />
        </>
      )}

      {/* Detalle de Productos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Detalle de Productos ({details.length})
          </h3>
        </div>

        <DetailSheetTable
          rows={details}
          getKey={(detail) => detail.id}
          emptyMessage="No hay productos asociados a esta solicitud"
          columns={
            [
              {
                header: "#",
                className: "text-left",
                render: (_detail, index) => (
                  <div className="text-sm font-medium">{index + 1}</div>
                ),
              },
              {
                header: "Producto",
                render: (detail, index) => (
                  <>
                    <div className="text-sm">{detail.product?.name}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        Código: {detail.product?.code || "N/A"}
                      </span>
                      {detail.product?.code && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-slate-200"
                          onClick={() => {
                            if (detail.product?.code) {
                              handleCopyCode(
                                detail.product.code,
                                "product_code",
                                index,
                              );
                            }
                          }}
                        >
                          {copiedIndex === index &&
                          copiedField === "product_code" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                ),
              },
              {
                header: "Tipo de Abastecimiento",
                className: "text-center",
                render: (detail) => (
                  <div className="text-sm text-muted-foreground">
                    {detail.supply_type}
                  </div>
                ),
              },
              {
                header: "Notas",
                render: (detail) => (
                  <div className="text-sm text-muted-foreground">
                    {detail.notes || "Sin notas"}
                  </div>
                ),
              },
              {
                header: "Cantidad",
                className: "text-center",
                render: (detail) => (
                  <div className="text-sm font-semibold">{detail.quantity}</div>
                ),
              },
            ] satisfies DetailSheetTableColumn<(typeof details)[0]>[]
          }
        />
      </div>

      {/* Información de Orden de Compra */}
      {purchaseRequest.purchase_order_id && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Orden de Compra Asociada
            </h3>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  ID Orden de Compra
                </p>
                <p className="text-sm font-semibold">
                  #{purchaseRequest.purchase_order_id}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
