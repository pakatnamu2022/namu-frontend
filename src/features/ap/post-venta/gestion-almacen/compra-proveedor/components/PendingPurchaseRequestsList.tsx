import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { CheckCircle2, XCircle, ShoppingCart, Loader } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
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
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Solicitudes Pendientes
          {!isLoading && (
            <Badge color="secondary" className="ml-auto text-xs">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)] px-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Cargando...</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {requests.map((detail) => (
                <Card
                  key={detail.id}
                  className="border-l-2 border-l-primary hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-2 space-y-2">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs line-clamp-2">
                        {detail.product_name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {detail.product_code}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">N°:</span>
                        <span className="font-medium">
                          {detail.request_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Cant:</span>
                        <span className="font-semibold">{detail.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Sol:</span>
                        <span className="font-medium">
                          {detail.requested_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1 h-7 px-2"
                              onClick={() => onAdd(detail)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Añadir a orden de compra</p>
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
                              className="flex-1 h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDiscard(detail)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Descartar solicitud</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
