import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Loader2 } from "lucide-react";
import { findProductById } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions.ts";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailSheet({
  productId,
  open,
  onOpenChange,
}: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => findProductById(productId!),
    enabled: open && productId !== null,
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "default" as const, label: "Activo" },
      INACTIVE: { color: "secondary" as const, label: "Inactivo" },
      DISCONTINUED: { color: "destructive" as const, label: "Descontinuado" },
    };
    return configs[status as keyof typeof configs] || configs.INACTIVE;
  };

  const getStockStatusConfig = (status: string) => {
    const configs = {
      NORMAL: { color: "default" as const, label: "Normal" },
      LOW: { color: "secondary" as const, label: "Stock Bajo" },
      OUT: { color: "destructive" as const, label: "Sin Stock" },
    };
    return configs[status as keyof typeof configs] || configs.NORMAL;
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={product ? product.name : "Detalle del Producto"}
      subtitle={product ? `Código: ${product.code}` : ""}
      icon="Box"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : product ? (
        <>
          <div className="mt-6 space-y-6">
            {/* Estado */}
            <div>
              <Badge color={getStatusConfig(product.status).color}>
                {getStatusConfig(product.status).label}
              </Badge>
            </div>

            {/* Información General */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Información General
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Código</p>
                  <p className="font-medium">{product.code}</p>
                </div>
                {product.dyn_code && (
                  <div>
                    <p className="text-muted-foreground">Código DYN</p>
                    <p className="font-medium">{product.dyn_code}</p>
                  </div>
                )}
                {product.nubefac_code && (
                  <div>
                    <p className="text-muted-foreground">Código Nubefac</p>
                    <p className="font-medium">{product.nubefac_code}</p>
                  </div>
                )}
                {product.description && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Descripción</p>
                    <p className="font-medium">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Categorización */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Categorización</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.category && (
                  <div>
                    <p className="text-muted-foreground">Categoría</p>
                    <p className="font-medium">
                      {product.category.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category.code}
                    </p>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <p className="text-muted-foreground">Marca</p>
                    <div className="flex items-center gap-2">
                      {product.brand.logo_min && (
                        <img
                          src={product.brand.logo_min}
                          alt={product.brand.name}
                          className="h-8 w-8 object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.brand.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand.group}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {product.unit_measurement && (
                  <div>
                    <p className="text-muted-foreground">Unidad de Medida</p>
                    <p className="font-medium">
                      {product.unit_measurement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.unit_measurement.dyn_code}
                    </p>
                  </div>
                )}
                {product.warranty_months !== undefined && (
                  <div>
                    <p className="text-muted-foreground">Garantía</p>
                    <p className="font-medium">
                      {product.warranty_months} meses
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Precios */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Precios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Precio de Costo
                  </p>
                  <p className="text-xl font-bold">
                    S/ {parseFloat(product.cost_price || "0").toFixed(2)}
                  </p>
                  {product.cost_with_tax && (
                    <p className="text-xs text-muted-foreground">
                      c/IGV: S/ {product.cost_with_tax.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Precio de Venta
                  </p>
                  <p className="text-xl font-bold">
                    S/ {parseFloat(product.sale_price).toFixed(2)}
                  </p>
                  {product.price_with_tax && (
                    <p className="text-xs text-muted-foreground">
                      c/IGV: S/ {product.price_with_tax.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p className="text-muted-foreground">
                  Tasa de Impuesto:{" "}
                  <span className="font-medium">
                    {product.tax_rate || "0"}%
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Gravable:{" "}
                  <span className="font-medium">
                    {product.is_taxable ? "Sí" : "No"}
                  </span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Stock por Almacén */}
            {product.warehouse_stocks &&
              product.warehouse_stocks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Stock por Almacén
                  </h3>
                  <div className="space-y-3">
                    {/* Resumen Total */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Stock Total
                          </p>
                          <p className="text-2xl font-bold">
                            {product.total_stock || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Stock Disponible
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {product.total_available_stock || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalle por Almacén */}
                    {product.warehouse_stocks.map((ws) => (
                      <div
                        key={ws.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {ws.warehouse.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {ws.warehouse.dyn_code} - {ws.warehouse.sede}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ws.warehouse.type_operation}
                            </p>
                          </div>
                          <Badge
                            color={getStockStatusConfig(ws.stock_status).color}
                          >
                            {getStockStatusConfig(ws.stock_status).label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cantidad</p>
                            <p className="font-semibold text-lg">
                              {ws.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Disponible</p>
                            <p className="font-semibold text-lg text-green-600">
                              {ws.available_quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reservado</p>
                            <p className="font-semibold text-lg text-orange-600">
                              {ws.reserved_quantity}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">
                              En Tránsito (Entre Almacenes)
                            </p>
                            <p className="font-medium">
                              {ws.quantity_in_transit}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Pend. N. Crédito
                            </p>
                            <p className="font-medium">
                              {ws.quantity_pending_credit_note}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">
                              Stock Mínimo
                            </p>
                            <p className="font-medium">{ws.minimum_stock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Stock Máximo
                            </p>
                            <p className="font-medium">{ws.maximum_stock}</p>
                          </div>
                        </div>

                        {ws.last_movement_date && (
                          <p className="text-xs text-muted-foreground">
                            Último movimiento:{" "}
                            {new Date(
                              ws.last_movement_date,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            No se pudo cargar la información del producto
          </p>
        </div>
      )}
    </GeneralSheet>
  );
}
