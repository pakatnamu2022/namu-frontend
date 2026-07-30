"use client";

import { useState } from "react";
import { Warehouse, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStock } from "../lib/inventory.interface";

interface ProductInfo {
  brand_name?: string | null;
  code?: string;
}

interface StockWarehousesCardProps {
  stock: ProductStock;
  productInfo?: ProductInfo;
  copyCodeKey?: string;
  copiedCodeKey?: string | null;
  onCopyCode?: (text: string, key: string) => void;
}

export function StockWarehousesCard({
  stock,
  productInfo,
  copyCodeKey = "stock-code",
  copiedCodeKey,
  onCopyCode,
}: StockWarehousesCardProps) {
  const [internalCopied, setInternalCopied] = useState(false);

  const handleCopy = async (text: string, key: string) => {
    if (onCopyCode) {
      onCopyCode(text, key);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setInternalCopied(true);
      setTimeout(() => setInternalCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const isCopied = onCopyCode ? copiedCodeKey === copyCodeKey : internalCopied;

  return (
    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            Stock Disponible
          </span>
        </div>
        {productInfo?.code && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary">
              Cod: <span className="font-medium">{productInfo.code}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-blue-100"
              onClick={() => handleCopy(productInfo.code!, copyCodeKey)}
              tooltip="Copiar código"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-primary" />
              )}
            </Button>
          </div>
        )}
      </div>

      {stock.warehouses.length > 0 ? (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left font-medium px-3 py-1.5 border-b border-gray-200">
                    Almacén
                  </th>
                  <th className="text-right font-medium px-3 py-1.5 border-b border-gray-200">
                    Disponible
                  </th>
                  <th className="text-right font-medium px-3 py-1.5 border-b border-gray-200">
                    Últ. compra
                  </th>
                  <th className="text-right font-medium px-3 py-1.5 border-b border-gray-200">
                    P. público
                  </th>
                  <th className="text-right font-medium px-3 py-1.5 border-b border-gray-200">
                    P. mín
                  </th>
                  <th className="text-right font-medium px-3 py-1.5 border-b border-gray-200">
                    Sin mov.
                  </th>
                  <th className="text-center font-medium px-3 py-1.5 border-b border-gray-200">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {stock.warehouses.map((warehouse, idx) => (
                  <tr
                    key={warehouse.warehouse_id}
                    className={
                      idx < stock.warehouses.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }
                  >
                    <td className="px-3 py-1.5 font-medium text-gray-800">
                      {warehouse.warehouse_name}
                    </td>
                    <td className="px-3 py-1.5 text-right text-green-600 font-semibold">
                      {warehouse.available_quantity}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.last_purchase_price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.public_sale_price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.minimum_sale_price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {warehouse.days_without_movement}d
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {warehouse.is_out_of_stock ? (
                        <Badge variant="outline" color="red" size="sm">
                          Sin Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" color="green" size="sm">
                          OK
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-1.5 border-t border-blue-300 text-xs font-semibold text-gray-700 flex items-center justify-between">
            <span>
              Total:{" "}
              <span className="text-green-600 text-sm">
                {stock.total_available_quantity}
              </span>{" "}
              disponibles
            </span>
            {stock.warehouses.length > 1 && (
              <Badge color="cyan" className="text-xs">
                {stock.warehouses.length} almacenes
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-white p-2 rounded">
          <AlertCircle className="h-3 w-3" />
          <span>Sin stock disponible</span>
        </div>
      )}
    </div>
  );
}
