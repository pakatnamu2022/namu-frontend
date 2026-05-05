import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { ApprovedAccessoryRow } from "./ApprovedAccessoriesTable";

interface CurrencyType {
  id: number;
  symbol?: string;
  code?: string;
}

interface GetColumnsParams {
  accessories: ApprovedAccesoriesResource[];
  allCurrencyTypes: CurrencyType[];
  invoiceCurrencyId?: number;
  getExchangeRate?: (currencyId: number) => number;
  calculateSubtotal: (
    accessory_id: number,
    quantity: number,
    additional_price?: number,
  ) => number;
  findCurrencyBySymbol: (symbol?: string) => CurrencyType | undefined;
  onEdit: (row: ApprovedAccessoryRow) => void;
  onDelete: (id: string) => void;
}

export function getApprovedAccessoriesColumns({
  accessories,
  allCurrencyTypes,
  invoiceCurrencyId,
  getExchangeRate,
  calculateSubtotal,
  findCurrencyBySymbol,
  onEdit,
  onDelete,
}: GetColumnsParams): ColumnDef<ApprovedAccessoryRow>[] {
  return [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            row.original.type === "OBSEQUIO"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-primary"
          }`}
        >
          {row.original.type === "OBSEQUIO" ? "Obsequio" : "Accesorio Adicional"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const accessory = accessories.find(
          (acc) => acc.id === row.original.accessory_id,
        );
        return accessory ? (
          <div className="space-y-1">
            <p className="font-medium text-sm">{accessory.description}</p>
            <div className="flex gap-3 text-xs text-gray-600">
              <span>
                Código:{" "}
                <span className="font-medium text-gray-800">{accessory.code}</span>
              </span>
              <span>
                Precio:{" "}
                <span className="font-medium text-gray-800">
                  {accessory.currency_symbol}{" "}
                  <NumberFormat value={Number(accessory.price).toFixed(2)} />
                </span>
              </span>
              {(row.original.additional_price ?? 0) > 0 && (
                <span>
                  Precio Adicional:{" "}
                  <span className="font-medium text-gray-800">
                    {accessory.currency_symbol}{" "}
                    <NumberFormat
                      value={Number(row.original.additional_price).toFixed(2)}
                    />
                  </span>
                </span>
              )}
            </div>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => {
        const accessory = accessories.find(
          (acc) => acc.id === row.original.accessory_id,
        );
        const subtotal = calculateSubtotal(
          row.original.accessory_id,
          row.original.quantity,
          row.original.additional_price,
        );
        return (
          <div className="text-right font-medium text-primary">
            {row.original.type === "OBSEQUIO" ? (
              <span className="text-green-600">
                {accessory ? accessory.currency_symbol : ""} 0.00
              </span>
            ) : accessory ? (
              `${accessory.currency_symbol} ${Number(subtotal).toFixed(2)}`
            ) : null}
          </div>
        );
      },
    },
    {
      id: "conversion",
      header: "Conversión",
      cell: ({ row }) => {
        if (!getExchangeRate || !invoiceCurrencyId || !allCurrencyTypes.length) {
          return <div className="text-center text-gray-400">—</div>;
        }
        const accessory = accessories.find(
          (acc) => acc.id === row.original.accessory_id,
        );
        if (!accessory?.currency_symbol) {
          return <div className="text-center text-gray-400">—</div>;
        }
        const accessoryCurrency = findCurrencyBySymbol(accessory.currency_symbol);
        if (!accessoryCurrency || accessoryCurrency.id === invoiceCurrencyId) {
          return <div className="text-center text-gray-400">—</div>;
        }
        const invoiceCurrency = allCurrencyTypes.find(
          (c) => c.id === invoiceCurrencyId,
        );
        const subtotal = calculateSubtotal(
          row.original.accessory_id,
          row.original.quantity,
          row.original.additional_price,
        );
        const tc = getExchangeRate(accessoryCurrency.id) / getExchangeRate(invoiceCurrencyId);
        const convertedSubtotal = subtotal * tc;
        return (
          <div className="text-right text-sm">
            {row.original.type === "OBSEQUIO" ? (
              <span className="font-medium text-green-600">
                {invoiceCurrency?.symbol ?? ""} 0.00
              </span>
            ) : (
              <span className="font-medium text-primary">
                {invoiceCurrency?.symbol ?? ""}{" "}
                <NumberFormat value={convertedSubtotal.toFixed(2)} />
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
