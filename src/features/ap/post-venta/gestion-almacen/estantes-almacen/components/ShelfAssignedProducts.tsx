import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Check, PackageSearch, Pencil, Trash2, X } from "lucide-react";
import TableSkeleton from "@/shared/components/TableSkeleton.tsx";
import { ShelfProductItem } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";

interface Props {
  products: ShelfProductItem[];
  isLoading: boolean;
  onRemove: (stockId: number) => void;
  onUpdatePosition: (stockId: number, position: string) => void;
  removingStockId: number | null;
}

export default function ShelfAssignedProducts({
  products,
  isLoading,
  onRemove,
  onUpdatePosition,
  removingStockId,
}: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [positionDraft, setPositionDraft] = useState("");

  const startEdit = (item: ShelfProductItem) => {
    setEditing(item.product_warehouse_stock_id);
    setPositionDraft(item.position ?? "");
  };

  const confirmEdit = (stockId: number) => {
    onUpdatePosition(stockId, positionDraft.trim());
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PackageSearch className="size-5" />
          Productos en el estante
          <Badge className="ml-1">{products.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <PackageSearch className="size-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Este estante está vacío</p>
            <p className="text-xs mt-1">
              Usa el panel de la derecha para agregar productos.
            </p>
          </div>
        ) : (
          <div className="border rounded-md divide-y max-h-128 overflow-y-auto">
            {products.map((item) => {
              const stockId = item.product_warehouse_stock_id;
              const isEditing = editing === stockId;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cód: {item.product?.code ?? "-"} · Stock:{" "}
                      {item.product?.quantity ?? 0} · Disp:{" "}
                      {item.product?.available_quantity ?? 0}
                    </p>
                  </div>

                  {/* Posición */}
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={positionDraft}
                        onChange={(e) => setPositionDraft(e.target.value)}
                        placeholder="Posición"
                        className="w-32 h-8 text-xs"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 text-green-600"
                        onClick={() => confirmEdit(stockId)}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => setEditing(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Badge color={item.position ? "default" : "secondary"}>
                        {item.position || "Sin posición"}
                      </Badge>
                      <Pencil className="size-3" />
                    </button>
                  )}

                  {/* Quitar */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onRemove(stockId)}
                    disabled={removingStockId === stockId}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
