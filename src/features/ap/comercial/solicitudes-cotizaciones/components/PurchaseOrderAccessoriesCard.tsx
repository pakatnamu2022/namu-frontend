import { Card, CardContent } from "@/components/ui/card";
import { PackageCheck } from "lucide-react";

interface PurchaseOrderAccessoriesCardProps {
  items?: Array<{
    id: number;
    description: string;
    unit_price: string | number;
    quantity: number;
    total: string | number;
    is_vehicle: boolean;
    unit_measurement?: {
      id: number;
      description: string;
    };
  }>;
  purchaseOrderNumber?: string;
  currencySymbol?: string;
}

const formatAmount = (value: string | number) => {
  const numeric = typeof value === "number" ? value : parseFloat(value.toString());
  return numeric.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const PurchaseOrderAccessoriesCard = ({
  items = [],
  purchaseOrderNumber,
  currencySymbol = "S/",
}: PurchaseOrderAccessoriesCardProps) => {
  // Filtrar solo los accesorios (items que no son vehículos)
  const accessories = items.filter((item) => !item.is_vehicle);

  if (accessories.length === 0) {
    return null;
  }

  const accessoriesTotal = accessories.reduce(
    (sum, item) =>
      sum +
      (typeof item.total === "number" ? item.total : parseFloat(item.total.toString())),
    0
  );

  return (
    <Card className="border-none shadow-sm bg-card p-0">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <PackageCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-semibold text-foreground">
              Accesorios de la Orden de Compra
            </span>
            {purchaseOrderNumber && (
              <span className="shrink-0 text-xs text-muted-foreground">
                · O/C {purchaseOrderNumber}
              </span>
            )}
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
            {currencySymbol} {formatAmount(accessoriesTotal)}
          </span>
        </div>

        <div className="mt-2 space-y-1">
          {accessories.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {item.description}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.unit_measurement?.description || "Unidad"} · Cant.{" "}
                  {item.quantity} · {currencySymbol} {formatAmount(item.unit_price)} c/u
                </p>
              </div>
              <p className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                {currencySymbol} {formatAmount(item.total)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
