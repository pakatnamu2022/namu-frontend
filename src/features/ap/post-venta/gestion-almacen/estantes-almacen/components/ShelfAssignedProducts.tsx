import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { PackageSearch, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { EditableCell } from "@/shared/components/EditableCell.tsx";
import { ShelfProductItem } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";

interface Props {
  products: ShelfProductItem[];
  isLoading: boolean;
  onRemove: (stockId: number) => void;
  onUpdatePosition: (stockId: number, position: string) => void;
  removingStockId: number | null;
}

const NO_SHELF = "—";

/** Agrupa por la letra inicial de la posición (A1, A2 → balda "A"). Sin letra → una sola balda. */
function groupIntoShelves(products: ShelfProductItem[]) {
  const groups = new Map<string, ShelfProductItem[]>();
  for (const item of products) {
    const pos = (item.position ?? "").trim().toUpperCase();
    const key = /^[A-Z]/.test(pos) ? pos[0] : NO_SHELF;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === NO_SHELF) return 1;
    if (b === NO_SHELF) return -1;
    return a.localeCompare(b);
  });
}

export default function ShelfAssignedProducts({
  products,
  isLoading,
  onRemove,
  onUpdatePosition,
  removingStockId,
}: Props) {
  const shelves = useMemo(() => groupIntoShelves(products), [products]);

  const handlePositionUpdate = (stockId: number, value: any) => {
    onUpdatePosition(
      stockId,
      String(value ?? "")
        .trim()
        .toUpperCase(),
    );
  };

  return (
    <Card className="border-[#e7ddc8] bg-[#fdfbf4]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PackageSearch className="size-5" />
          El estante
          <Badge className="ml-1">{products.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3 rounded-xl border border-[#e7ddc8] bg-[#faf6ec] p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-md bg-[#efe8d5]"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#e7ddc8] bg-[#faf6ec] py-12 text-center text-muted-foreground">
            <PackageSearch className="mx-auto mb-2 size-10 opacity-40" />
            <p className="text-sm font-medium">Este estante está vacío</p>
            <p className="mt-1 text-xs">
              Agrega repuestos desde el panel de arriba.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e7ddc8] rounded-md bg-[#faf6ec]">
            {shelves.map(([shelfKey, items]) => (
              <div key={shelfKey} className="relative px-3 pb-3 pt-3">
                {shelfKey !== NO_SHELF && (
                  <span className="mb-2 inline-block rounded bg-[#e7ddc8] px-1.5 py-0.5 text-[10px] font-bold text-[#6b6350]">
                    Balda {shelfKey}
                  </span>
                )}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => {
                    const stockId = item.product_warehouse_stock_id;
                    const isRemoving = removingStockId === stockId;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group relative flex flex-col gap-1.5 rounded-md border border-[#e7ddc8] bg-card p-2.5 shadow-sm transition-colors hover:border-primary/40",
                          isRemoving && "pointer-events-none opacity-50",
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => onRemove(stockId)}
                              disabled={isRemoving}
                              className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Quitar del estante</TooltipContent>
                        </Tooltip>

                        <p
                          className="line-clamp-2 `min-h-10 pr-5 text-xs font-medium leading-tight"
                          title={item.product?.name}
                        >
                          {item.product?.name}
                        </p>

                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {item.product?.code ?? "—"}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <EditableCell
                                  id={stockId}
                                  value={item.position ?? ""}
                                  isNumber={false}
                                  onUpdate={handlePositionUpdate}
                                  widthClass="w-14"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Posición en el estante
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
