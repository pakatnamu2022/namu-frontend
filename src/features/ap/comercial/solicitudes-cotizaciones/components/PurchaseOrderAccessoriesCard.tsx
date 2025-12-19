import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <Card className="bg-gray-50 border-gray-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-base font-semibold text-gray-700">
            Accesorios de la Orden de Compra
          </CardTitle>
        </div>
        {purchaseOrderNumber && (
          <CardDescription className="text-xs">
            O/C N° {purchaseOrderNumber}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {accessories.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start p-2 bg-white rounded border border-gray-200"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.description}
                </p>
                <p className="text-xs text-gray-500">
                  {item.unit_measurement?.description || "Unidad"} | Cantidad:{" "}
                  {item.quantity}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-gray-800">
                  {currencySymbol}{" "}
                  {typeof item.total === "number"
                    ? item.total.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : parseFloat(item.total.toString()).toLocaleString(
                        "es-PE",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                </p>
                <p className="text-xs text-gray-500">
                  {currencySymbol}{" "}
                  {typeof item.unit_price === "number"
                    ? item.unit_price.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : parseFloat(item.unit_price.toString()).toLocaleString(
                        "es-PE",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                  c/u
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 italic">
            Estos son los accesorios con los que se realizó la orden de compra
            del vehículo
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
