import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Loader,
  Search,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { PurchaseRequestDetailResource } from "../../../taller/solicitud-compra/lib/purchaseRequest.interface.ts";

interface PendingPurchaseRequestsListProps {
  requests: PurchaseRequestDetailResource[];
  isLoading: boolean;
  onAdd: (request: PurchaseRequestDetailResource) => void;
  onDiscard: (request: PurchaseRequestDetailResource) => void;
}

export const PendingPurchaseRequestsList = ({
  requests,
  isLoading,
  onAdd,
  onDiscard,
}: PendingPurchaseRequestsListProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const formatCurrency = (amount: number | string | null, symbol?: string) => {
    const parsedAmount =
      typeof amount === "string" ? Number.parseFloat(amount) : amount;
    const safeAmount =
      typeof parsedAmount === "number" && Number.isFinite(parsedAmount)
        ? parsedAmount
        : 0;
    return `${symbol ?? "$"}${safeAmount.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const filtered = search.trim()
    ? requests.filter((d) => {
        const q = search.toLowerCase();
        return (
          d.product_name?.toLowerCase().includes(q) ||
          d.product_code?.toLowerCase().includes(q) ||
          d.requested_name?.toLowerCase().includes(q) ||
          d.request_number?.toString().toLowerCase().includes(q)
        );
      })
    : requests;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Solicitudes Pendientes
        {isLoading ? (
          <Loader className="h-3.5 w-3.5 animate-spin" />
        ) : requests.length > 0 ? (
          <Badge className="ml-1 text-xs">{requests.length}</Badge>
        ) : null}
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => {
          setOpen(false);
          setSearch("");
        }}
        title="Solicitudes Pendientes"
        subtitle="Selecciona solicitudes para añadirlas a la orden de compra"
        icon="ShoppingCart"
        size="2xl"
        modal={false}
      >
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por repuesto, asesor o N° solicitud..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Contador */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} solicitud(es) encontrada(s)
            </p>
          )}

          {/* Lista */}
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cargando solicitudes...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 opacity-40" />
                <p className="text-sm">No hay solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {filtered.map((detail) => (
                  <Card key={detail.id} className="border-l-2 border-l-primary">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-semibold text-sm truncate">
                            {detail.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {detail.product_code}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                            <span>
                              N°{" "}
                              <span className="font-medium text-foreground">
                                {detail.request_number}
                              </span>
                            </span>
                            <span>
                              Cant:{" "}
                              <span className="font-medium text-foreground">
                                {detail.quantity}
                              </span>
                            </span>
                            <span>
                              Asesor:{" "}
                              <span className="font-medium text-foreground">
                                {detail.requested_name}
                              </span>
                            </span>
                            <span>
                              Costo Unit.:{" "}
                              <span className="font-medium text-foreground">
                                {formatCurrency(
                                  detail.unit_price,
                                  detail.currency_symbol,
                                )}
                              </span>
                            </span>
                            <span>
                              Desc.:{" "}
                              <span className="font-medium text-foreground">
                                {detail.discount_percentage}%
                              </span>
                            </span>
                            <span>
                              Total:{" "}
                              <span className="font-medium text-foreground">
                                {formatCurrency(
                                  detail.total_amount,
                                  detail.currency_symbol,
                                )}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => onAdd(detail)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Añadir a la orden</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => onDiscard(detail)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Descartar solicitud</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </GeneralSheet>
    </>
  );
};
