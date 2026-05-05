"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2, Car } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormInput } from "@/shared/components/FormInput";
import { useMemo } from "react";

export interface PurchaseOrderItem {
  unit_measurement_id: string;
  description: string;
  unit_price: number;
  quantity: number;
  is_vehicle?: boolean;
}

export type PurchaseOrderItemColumns = ColumnDef<PurchaseOrderItem>;

interface Props {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  onRemove: (index: number) => void;
  isVehiclePurchase: boolean;
  isConsignmentOrder?: boolean;
  unitMeasurements: Array<{
    id: number;
    dyn_code: string;
    description: string;
  }>;
}

export const purchaseOrderItemsColumns = ({
  control,
  watch,
  onRemove,
  isVehiclePurchase,
  isConsignmentOrder,
  unitMeasurements,
}: Props): PurchaseOrderItemColumns[] => [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <div className="flex items-center justify-center gap-1 h-full">
          {(isVehiclePurchase || isConsignmentOrder) && index === 0 ? (
            <Car className="h-4 w-4 text-primary" />
          ) : (
            <span className="text-sm font-medium">{index + 1}</span>
          )}
        </div>
      );
    },
    size: 50,
  },
  {
    accessorKey: "unit_measurement_id",
    header: "Unidad de Medida",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <FormSelect
          name={`items.${index}.unit_measurement_id`}
          placeholder="Selecciona"
          className={isVehiclePurchase && index === 0 ? "bg-muted" : ""}
          disabled={isVehiclePurchase && index === 0}
          options={unitMeasurements.map((item) => ({
            label: item.dyn_code + " - " + item.description,
            value: item.id.toString(),
          }))}
          control={control}
        />
      );
    },
    size: 180,
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <FormInput
          control={control}
          name={`items.${index}.description`}
          placeholder="Descripción del item"
          type="text"
          disabled={isVehiclePurchase && index === 0}
          className={isVehiclePurchase && index === 0 ? "bg-muted" : ""}
        />
      );
    },
    size: 250,
  },
  {
    accessorKey: "unit_price",
    header: "Precio Unitario",
    cell: ({ row }) => {
      const index = row.index;

      const isVehicleRow = isVehiclePurchase && index === 0;
      const priceEditable = isConsignmentOrder && index === 0;

      return (
        <FormInput
          control={control}
          name={`items.${index}.unit_price`}
          min={0}
          type="number"
          step="0.01"
          placeholder="0.00"
          disabled={isVehicleRow && !priceEditable}
          className={isVehicleRow && !priceEditable ? "bg-muted" : ""}
        />
      );
    },
    size: 140,
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <FormInput
          control={control}
          name={`items.${index}.quantity`}
          min={0}
          type="number"
          placeholder="1"
          disabled={isVehiclePurchase && index === 0}
          className={isVehiclePurchase && index === 0 ? "bg-muted" : ""}
        />
      );
    },
    size: 80,
  },
  {
    id: "subtotal",
    header: () => <div className="text-end">Subtotal</div>,
    cell: ({ row }) => {
      const index = row.index;
      const itemPrice = watch(`items.${index}.unit_price`) || 0;
      const itemQty = watch(`items.${index}.quantity`) || 0;
      const itemSubtotal = Number(itemPrice) * Number(itemQty);

      return (
        <div className="text-sm font-medium text-end">
          {new Intl.NumberFormat("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(itemSubtotal)}
        </div>
      );
    },
    size: 140,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Acción</div>,
    cell: ({ row }) => {
      const index = row.index;

      if ((isVehiclePurchase || isConsignmentOrder) && index === 0) {
        return (
          <div className="text-center">
            <span className="text-xs text-muted-foreground">-</span>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    size: 80,
  },
];

// Hook personalizado que memoriza las columnas automáticamente
export const usePurchaseOrderItemsColumns = (props: Props) => {
  return useMemo(
    () => purchaseOrderItemsColumns(props),
    [
      props.control,
      props.watch,
      props.setValue,
      props.onRemove,
      props.isVehiclePurchase,
      props.isConsignmentOrder,
      props.unitMeasurements,
    ]
  );
};
