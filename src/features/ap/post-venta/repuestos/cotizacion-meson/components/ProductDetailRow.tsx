"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { StockByProductIdsResponse } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface";
import { StockWarehousesCard } from "@/features/ap/post-venta/gestion-almacen/inventario/components/StockWarehousesCard";
import { ProductDetailMesonSchema } from "../lib/quotationMeson.schema";
import { onSelectSupplyType } from "../../../taller/cotizacion-detalle/lib/proformaDetails.constants";

interface ProductDetailRowProps {
  index: number;
  detail: ProductDetailMesonSchema;
  selectedCurrency: any;
  stockData: StockByProductIdsResponse | null;
  showStock: boolean;
  onToggleStock: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onChangeSupplyType?: (value: string) => void;
  isDetailsDisabled?: boolean;
  sedeId?: string;
}

export default function ProductDetailRow({
  index,
  detail,
  selectedCurrency,
  stockData,
  showStock,
  onToggleStock,
  onEdit,
  onRemove,
  onChangeSupplyType,
  isDetailsDisabled = false,
  sedeId,
}: ProductDetailRowProps) {
  if (!detail) return null;

  const supplyTypeBadge = (className: string) => {
    const badge = (
      <Badge
        variant="outline"
        className={
          className +
          (onChangeSupplyType && !isDetailsDisabled
            ? " cursor-pointer hover:bg-accent"
            : "")
        }
      >
        {supplyTypeLabel}
      </Badge>
    );

    if (!onChangeSupplyType) return badge;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isDetailsDisabled}
          className="rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          {badge}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {onSelectSupplyType.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChangeSupplyType(option.value)}
              className={
                option.value === detail.supply_type ? "font-semibold" : ""
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const currentProductStock = stockData?.data?.find(
    (stock) => stock.product_id === Number(detail.product_id),
  );
  const hasStock = !!currentProductStock;
  const hasStockInSede = !!currentProductStock?.warehouses.some(
    (warehouse) =>
      warehouse.sede_id === Number(sedeId) && warehouse.available_quantity > 0,
  );

  const productLabel = currentProductStock?.product_code
    ? `${currentProductStock.product_code} - ${detail.description}`
    : detail.description;

  const supplyTypeLabel =
    onSelectSupplyType.find((opt) => opt.value === detail.supply_type)
      ?.label || detail.supply_type;

  const quantity = detail?.quantity || 0;
  const unitPrice = detail?.unit_price || 0;
  const discount = detail?.discount_percentage || 0;
  const subtotal = quantity * unitPrice;
  const computedTotal =
    Math.round((subtotal - subtotal * (discount / 100)) * 100) / 100;

  return (
    <div className="border rounded-lg bg-white transition-colors">
      {/* Vista Desktop */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center">
        <div className="col-span-4 flex items-center gap-2 min-w-0">
          <span className="shrink-0 inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{productLabel}</p>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {supplyTypeBadge("text-[10px] py-0 px-1.5 h-4")}
              {hasStock && (
                <Badge
                  color={hasStockInSede ? "green" : "destructive"}
                  className="text-[10px] py-0 px-1.5 h-4"
                >
                  {hasStockInSede ? "Con stock" : "Sin stock en sede"}
                </Badge>
              )}
              {detail.observations && (
                <span className="text-[10px] text-gray-500 truncate">
                  {detail.observations}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 text-center text-sm">{quantity}</div>
        <div className="col-span-2 text-center text-sm font-medium">
          {selectedCurrency?.symbol || "S/."} {unitPrice.toFixed(2)}
        </div>
        <div className="col-span-1 text-center text-sm">
          {discount.toFixed(2)}%
        </div>
        <div className="col-span-2 text-center text-sm font-bold text-primary">
          {selectedCurrency?.symbol || "S/."} {computedTotal.toFixed(2)}
        </div>

        <div className="col-span-2 flex justify-center items-center gap-1">
          {hasStock && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${showStock ? "text-primary hover:text-primary/80 hover:bg-primary/10" : "text-gray-400 hover:text-primary hover:bg-primary/10"}`}
              onClick={onToggleStock}
              tooltip={showStock ? "Ocultar almacenes" : "Ver almacenes"}
            >
              {showStock ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={onEdit}
            disabled={isDetailsDisabled}
            tooltip="Editar repuesto"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
            disabled={isDetailsDisabled}
            tooltip="Eliminar repuesto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {hasStock && showStock && (
          <div className="col-span-12">
            <StockWarehousesCard stock={currentProductStock!} />
          </div>
        )}
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge color="secondary" className="text-xs shrink-0">
              #{index + 1}
            </Badge>
            <p className="text-sm font-medium truncate">{productLabel}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hasStock && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 transition-colors ${showStock ? "text-primary hover:text-primary/80 hover:bg-primary/10" : "text-gray-400 hover:text-primary hover:bg-primary/10"}`}
                onClick={onToggleStock}
                tooltip={showStock ? "Ocultar almacenes" : "Ver almacenes"}
              >
                {showStock ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              onClick={onEdit}
              disabled={isDetailsDisabled}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onRemove}
              disabled={isDetailsDisabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {supplyTypeBadge("text-[10px] py-0 px-1.5 h-4")}
          {hasStock && (
            <Badge
              color={hasStockInSede ? "green" : "destructive"}
              className="text-[10px] py-0 px-1.5 h-4"
            >
              {hasStockInSede ? "Con stock" : "Sin stock en sede"}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Cant.</span>
            <p className="font-medium">{quantity}</p>
          </div>
          <div>
            <span className="text-gray-500">P.Unit.</span>
            <p className="font-medium">
              {selectedCurrency?.symbol || "S/."} {unitPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Dcto%</span>
            <p className="font-medium">{discount.toFixed(2)}%</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1 border-t">
          <span className="text-xs text-gray-600">Total</span>
          <span className="text-sm font-bold text-primary">
            {selectedCurrency?.symbol || "S/."} {computedTotal.toFixed(2)}
          </span>
        </div>

        {hasStock && showStock && (
          <StockWarehousesCard stock={currentProductStock!} />
        )}
      </div>
    </div>
  );
}
