import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Loader2 } from "lucide-react";
import { findProductById } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions.ts";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { InfoSection } from "@/shared/components/InfoSection";

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
          <div className="space-y-6 px-6">
            {/* Estado */}
            <div>
              <Badge color={getStatusConfig(product.status).color}>
                {getStatusConfig(product.status).label}
              </Badge>
            </div>

            {/* Información General */}
            <InfoSection
              title="Información General"
              fields={[
                { label: "Código", value: product.code },
                { label: "Código DYN", value: product.dyn_code },
                ...(product.description
                  ? [
                      {
                        label: "Descripción",
                        value: product.description,
                        fullWidth: true,
                      },
                    ]
                  : []),
              ]}
            />

            <Separator />

            {/* Categorización */}
            <InfoSection
              title="Categorización"
              fields={[
                {
                  label: "Categoría",
                  value: (
                    <div>
                      <p className="font-medium">
                        {product.category.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category.code}
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Marca",
                  value: (
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
                  ),
                },
                {
                  label: "Unidad de Medida",
                  value: (
                    <div>
                      <p className="font-medium">
                        {product.unit_measurement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.unit_measurement.dyn_code}
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Garantía",
                  value: `${product.warranty_months ?? 0} meses`,
                },
              ]}
            />

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

                        <Separator />

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">
                              Precio de Costo
                            </p>
                            <p className="font-medium">
                              S/ {Number(ws.cost_price).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Costo Promedio
                            </p>
                            <p className="font-medium">
                              S/ {Number(ws.average_cost).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Precio de Venta
                            </p>
                            <p className="font-medium">
                              S/ {Number(ws.sale_price).toFixed(2)}
                            </p>
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
