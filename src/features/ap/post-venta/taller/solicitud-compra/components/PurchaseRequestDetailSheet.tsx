import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, Package, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { findPurchaseRequestById } from "../lib/purchaseRequest.actions";
import type { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { PURCHASE_REQUEST_STATUS } from "../lib/purchaseRequest.constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  const hasDetails = details.length > 0;
  const statusText =
    PURCHASE_REQUEST_STATUS[
      purchaseRequest.status as keyof typeof PURCHASE_REQUEST_STATUS
    ] || purchaseRequest.status;

  return (
    <div className="space-y-6 px-6">
      {/* Información General */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Información General
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Número de Solicitud</p>
            <p className="text-sm font-semibold">
              {purchaseRequest.request_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Solicitada</p>
            <p className="text-sm font-medium">
              {purchaseRequest.requested_date
                ? format(
                    new Date(purchaseRequest.requested_date),
                    "dd/MM/yyyy",
                    {
                      locale: es,
                    },
                  )
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Solicitado Por</p>
            <p className="text-sm font-medium">
              {purchaseRequest.requested_by || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge
              style={{
                backgroundColor: purchaseRequest.status_color || "#6B7280",
              }}
            >
              {statusText}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Almacén</p>
            <p className="text-sm font-medium">
              {purchaseRequest.warehouse.description || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Suministro</p>
            <Badge variant="outline">
              {purchaseRequest.supply_type || "N/A"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de Creación</p>
            <p className="text-sm font-medium">
              {purchaseRequest.created_at
                ? format(
                    new Date(purchaseRequest.created_at),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: es,
                    },
                  )
                : "N/A"}
            </p>
          </div>
          {purchaseRequest.observations && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Observaciones</p>
              <p className="text-sm font-medium">
                {purchaseRequest.observations}
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Información de la Cotización Asociada */}
      {purchaseRequest.ap_order_quotation && (
        <>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Cotización Asociada
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  Número de Cotización
                </p>
                <p className="text-sm font-semibold">
                  {purchaseRequest.ap_order_quotation.quotation_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha Cotización
                </p>
                <p className="text-sm font-medium">
                  {purchaseRequest.ap_order_quotation.quotation_date
                    ? format(
                        new Date(
                          purchaseRequest.ap_order_quotation.quotation_date,
                        ),
                        "dd/MM/yyyy",
                        { locale: es },
                      )
                    : "N/A"}
                </p>
              </div>
              {purchaseRequest.ap_order_quotation.vehicle && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Placa</p>
                    <p className="text-sm font-semibold">
                      {purchaseRequest.ap_order_quotation.vehicle.plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">VIN</p>
                    <p className="text-sm font-medium">
                      {purchaseRequest.ap_order_quotation.vehicle.vin || "N/A"}
                    </p>
                  </div>
                  {purchaseRequest.ap_order_quotation.vehicle.owner && (
                    <>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Cliente</p>
                        <p className="text-sm font-medium">
                          {
                            purchaseRequest.ap_order_quotation.vehicle.owner
                              .full_name
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Documento
                        </p>
                        <p className="text-sm font-medium">
                          {purchaseRequest.ap_order_quotation.vehicle.owner
                            .num_doc || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Teléfono
                        </p>
                        <p className="text-sm font-medium">
                          {purchaseRequest.ap_order_quotation.vehicle.owner
                            .phone || "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Cotización
                </p>
                <p className="text-sm font-semibold text-primary">
                  {purchaseRequest.ap_order_quotation.type_currency?.symbol ||
                    "S/."}{" "}
                  {purchaseRequest.ap_order_quotation.total_amount.toLocaleString(
                    "es-PE",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="text-sm font-medium">
                  {purchaseRequest.ap_order_quotation.status || "N/A"}
                </p>
              </div>
            </div>
          </div>
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

        {!hasDetails ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No hay productos asociados a esta solicitud
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-left">Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {detail.product?.code || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {detail.product?.name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-semibold">
                        {detail.quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {detail.notes || "Sin notas"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
