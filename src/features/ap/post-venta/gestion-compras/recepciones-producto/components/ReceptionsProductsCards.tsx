import { ReceptionResource } from "../lib/receptions-products.interface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar, FileText, Package, User, Box } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: ReceptionResource[];
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  routeUpdate?: string;
  purchaseOrderNumber?: string;
  warehouseName?: string;
}

export default function ReceptionsProductsCards({
  data,
  onDelete,
  permissions,
  routeUpdate,
  purchaseOrderNumber,
  warehouseName,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay recepciones registradas
      </div>
    );
  }

  // Determinar el número de columnas según la cantidad de registros
  const getGridCols = () => {
    if (data.length === 1) return "grid-cols-1";
    if (data.length === 2) return "grid-cols-1 lg:grid-cols-2";
    return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
  };

  const isSingleCard = data.length === 1;

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {data.map((reception) => (
        <Card key={reception.id} className="hover:shadow-md transition-shadow">
          <CardContent className={isSingleCard ? "p-6" : "p-4 space-y-3"}>
            {/* Header con número de recepción y acciones */}
            <div
              className={`flex items-start justify-between ${
                isSingleCard ? "gap-4 mb-6" : "gap-2"
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`font-bold text-primary ${
                    isSingleCard ? "text-2xl" : "text-lg"
                  }`}
                >
                  {reception.reception_number || `#${reception.id}`}
                </h3>
                <p
                  className={`text-muted-foreground ${
                    isSingleCard ? "text-sm mt-1" : "text-xs"
                  }`}
                >
                  Orden: {purchaseOrderNumber || "-"}
                </p>
              </div>
              <div className="flex gap-2">
                {permissions.canUpdate && routeUpdate && (
                  <Link to={`${routeUpdate}/${reception.id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className={isSingleCard ? "size-9" : "size-8"}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                )}
                {permissions.canDelete && (
                  <DeleteButton onClick={() => onDelete(reception.id)} />
                )}
              </div>
            </div>

            {/* Información principal - Layout diferente según cantidad */}
            <div
              className={
                isSingleCard
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                  : "space-y-2"
              }
            >
              {/* Fecha de recepción */}
              <div
                className={`flex items-center ${
                  isSingleCard ? "flex-col items-start" : "gap-2"
                } text-sm`}
              >
                <Calendar
                  className={`size-4 text-muted-foreground shrink-0 ${
                    isSingleCard ? "mb-2" : ""
                  }`}
                />
                <div>
                  <p
                    className={`text-muted-foreground ${
                      isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                    }`}
                  >
                    Fecha
                  </p>
                  <p
                    className={`font-medium ${isSingleCard ? "text-base" : ""}`}
                  >
                    {reception.reception_date
                      ? format(
                          new Date(reception.reception_date),
                          "dd/MM/yyyy",
                          {
                            locale: es,
                          }
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Almacén */}
              <div
                className={`flex items-center ${
                  isSingleCard ? "flex-col items-start" : "gap-2"
                } text-sm`}
              >
                <Package
                  className={`size-4 text-muted-foreground shrink-0 ${
                    isSingleCard ? "mb-2" : ""
                  }`}
                />
                <div>
                  <p
                    className={`text-muted-foreground ${
                      isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                    }`}
                  >
                    Almacén
                  </p>
                  <p
                    className={`font-medium ${isSingleCard ? "text-base" : ""}`}
                  >
                    {warehouseName || "-"}
                  </p>
                </div>
              </div>

              {/* Guía de remisión */}
              {reception.shipping_guide_number && (
                <div
                  className={`flex items-center ${
                    isSingleCard ? "flex-col items-start" : "gap-2"
                  } text-sm`}
                >
                  <FileText
                    className={`size-4 text-muted-foreground shrink-0 ${
                      isSingleCard ? "mb-2" : ""
                    }`}
                  />
                  <div>
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Guía de Remisión
                    </p>
                    <p
                      className={`font-medium ${
                        isSingleCard ? "text-base" : ""
                      }`}
                    >
                      {reception.shipping_guide_number}
                    </p>
                  </div>
                </div>
              )}

              {/* Total items */}
              {reception.total_items !== undefined && (
                <div
                  className={`flex items-center ${
                    isSingleCard ? "flex-col items-start" : "pt-2 border-t"
                  }`}
                >
                  {isSingleCard && (
                    <Package className="size-4 text-muted-foreground mb-2" />
                  )}
                  <div>
                    {isSingleCard && (
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Total Items
                      </p>
                    )}
                    <Badge
                      variant="secondary"
                      className={isSingleCard ? "text-sm" : "text-xs"}
                    >
                      {reception.total_items}{" "}
                      {reception.total_items === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Recibido por */}
              {reception.received_by_user_name && (
                <div
                  className={`flex items-center ${
                    isSingleCard ? "flex-col items-start" : "gap-2"
                  } text-sm`}
                >
                  <User
                    className={`size-4 text-muted-foreground shrink-0 ${
                      isSingleCard ? "mb-2" : ""
                    }`}
                  />
                  <div>
                    <p
                      className={`text-muted-foreground ${
                        isSingleCard ? "text-xs font-medium mb-1" : "text-xs"
                      }`}
                    >
                      Recibido por
                    </p>
                    <p
                      className={`font-medium ${
                        isSingleCard ? "text-sm" : "text-xs"
                      }`}
                    >
                      {reception.received_by_user_name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de productos recepcionados */}
            {reception.details && reception.details.length > 0 && (
              <div
                className={`${
                  isSingleCard ? "pt-6" : "pt-3"
                } border-t space-y-2`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Box
                    className={`text-muted-foreground ${
                      isSingleCard ? "size-5" : "size-4"
                    }`}
                  />
                  <p
                    className={`font-semibold text-muted-foreground uppercase ${
                      isSingleCard ? "text-sm" : "text-xs"
                    }`}
                  >
                    Productos Recepcionados
                  </p>
                </div>
                <div
                  className={`space-y-2 ${
                    isSingleCard ? "max-h-64" : "max-h-48"
                  } overflow-y-auto`}
                >
                  {reception.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-start gap-3 p-3 rounded bg-muted/30 ${
                        isSingleCard ? "text-sm" : "text-xs"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            isSingleCard ? "text-base" : ""
                          }`}
                        >
                          {detail.product?.name ||
                            detail.purchase_order_item?.product_name ||
                            "Producto sin nombre"}
                        </p>
                        {detail.product?.code && (
                          <p
                            className={`text-muted-foreground ${
                              isSingleCard ? "text-xs mt-1" : "text-[10px]"
                            }`}
                          >
                            Código: {detail.product.code}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            isSingleCard ? "text-xs h-6" : "text-[10px] h-5"
                          }
                        >
                          {detail.quantity_received}
                          {detail.observed_quantity &&
                            Number(detail.observed_quantity) > 0 && (
                              <span className="text-destructive ml-1">
                                (-{detail.observed_quantity})
                              </span>
                            )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
