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

  const isCopied =
    onCopyCode ? copiedCodeKey === copyCodeKey : internalCopied;

  return (
    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            Stock Disponible
          </span>
        </div>
        {productInfo?.brand_name && (
          <span className="text-xs text-primary">
            Marca:{" "}
            <span className="font-medium">{productInfo.brand_name}</span>
          </span>
        )}
        {productInfo?.code && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary">
              Cod:{" "}
              <span className="font-medium">{productInfo.code}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {stock.warehouses.map((warehouse) => (
              <div
                key={warehouse.warehouse_id}
                className="bg-white p-2 rounded border border-blue-100 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-800 text-xs">
                    {warehouse.warehouse_name}
                  </span>
                  {warehouse.is_out_of_stock && (
                    <Badge
                      color="destructive"
                      className="text-xs py-0 px-1 h-4"
                    >
                      Sin Stock
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Disp:</span>
                    <span className="ml-1 text-green-600 font-bold">
                      {warehouse.available_quantity}
                    </span>
                  </div>
                  {warehouse.quantity_in_transit > 0 && (
                    <div>
                      <span className="text-gray-500">Trán:</span>
                      <span className="ml-1 text-primary font-bold">
                        {warehouse.quantity_in_transit}
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] pt-1 border-t border-gray-200">
                  <div>
                    <div className="text-gray-500">Últ. compra</div>
                    <div className="font-semibold text-gray-700">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.last_purchase_price?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">P. público</div>
                    <div className="font-semibold text-gray-700">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.public_sale_price?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">P. mín</div>
                    <div className="font-semibold text-gray-700">
                      {warehouse.currency.symbol || "S/."}{" "}
                      {warehouse.minimum_sale_price?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Sin mov.</div>
                    <div className="font-semibold text-gray-700">
                      {warehouse.days_without_movement} días
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <Badge color="secondary" className="text-xs">
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
