import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Check, Loader, PackagePlus, Plus, ShoppingCart, X } from "lucide-react";
import SearchInput from "@/shared/components/SearchInput.tsx";
import { useInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";

interface Props {
  warehouseId: number;
  assignedStockIds: Set<number>;
  onAssign: (
    items: { product_warehouse_stock_id: number; position?: string }[],
  ) => void;
  isAssigning: boolean;
}

interface DraftItem {
  stockId: number;
  productName: string;
  productCode: string;
  position: string;
}

export default function ShelfProductPicker({
  warehouseId,
  assignedStockIds,
  onAssign,
  isAssigning,
}: Props) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Record<number, DraftItem>>({});

  const { data, isLoading } = useInventory(
    {
      page: 1,
      per_page: 20,
      search,
      warehouse_id: warehouseId,
    },
    { enabled: !!warehouseId },
  );

  const rows = useMemo(
    () =>
      (data?.data || []).filter(
        (row) => !assignedStockIds.has(row.id) && !draft[row.id],
      ),
    [data?.data, assignedStockIds, draft],
  );

  const draftList = Object.values(draft);

  const addToDraft = (row: {
    id: number;
    product_name: string;
    product: { code: string };
  }) => {
    setDraft((prev) => ({
      ...prev,
      [row.id]: {
        stockId: row.id,
        productName: row.product_name,
        productCode: row.product?.code ?? "",
        position: "",
      },
    }));
  };

  const removeFromDraft = (stockId: number) => {
    setDraft((prev) => {
      const next = { ...prev };
      delete next[stockId];
      return next;
    });
  };

  const setDraftPosition = (stockId: number, position: string) => {
    setDraft((prev) => ({
      ...prev,
      [stockId]: { ...prev[stockId], position },
    }));
  };

  const handleConfirm = () => {
    onAssign(
      draftList.map((d) => ({
        product_warehouse_stock_id: d.stockId,
        position: d.position.trim() || undefined,
      })),
    );
    setDraft({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PackagePlus className="size-5" />
          Agregar repuestos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          {/* Buscador + resultados */}
          <div className="space-y-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o código..."
            />

            <div className="max-h-[26rem] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[4.5rem] animate-pulse rounded-lg border bg-muted/40"
                    />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No hay repuestos disponibles para agregar.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {rows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => addToDraft(row)}
                      className="group relative flex flex-col gap-1 rounded-lg border bg-card p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span
                        className="line-clamp-2 min-h-[2.5rem] pr-5 text-xs font-medium leading-tight"
                        title={row.product_name}
                      >
                        {row.product_name}
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {row.product?.code ?? "—"}
                      </span>
                      <span className="absolute right-1.5 top-1.5 rounded-md bg-primary/10 p-1 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Plus className="size-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Carrito lateral: por asignar */}
          <div className="flex flex-col rounded-lg border bg-muted/30 lg:max-h-[30rem]">
            <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
              <ShoppingCart className="size-4" />
              Por asignar
              <Badge className="ml-auto">{draftList.length}</Badge>
            </div>

            {draftList.length === 0 ? (
              <p className="flex-1 px-3 py-8 text-center text-xs text-muted-foreground">
                Haz clic en un repuesto para agregarlo aquí.
              </p>
            ) : (
              <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                {draftList.map((d) => (
                  <div
                    key={d.stockId}
                    className="flex items-center gap-2 rounded-md border bg-card p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-medium leading-tight"
                        title={d.productName}
                      >
                        {d.productName}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {d.productCode || "—"}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          value={d.position}
                          onChange={(e) =>
                            setDraftPosition(
                              d.stockId,
                              e.target.value.toUpperCase(),
                            )
                          }
                          maxLength={6}
                          placeholder="—"
                          className="h-7 w-14 px-1 text-center text-xs font-semibold uppercase"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Posición (opcional)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => removeFromDraft(d.stockId)}
                          className="rounded-md p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Quitar</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t p-2">
              <Button
                type="button"
                className="w-full"
                size="sm"
                onClick={handleConfirm}
                disabled={isAssigning || draftList.length === 0}
              >
                {isAssigning ? (
                  <Loader className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                {isAssigning
                  ? "Asignando..."
                  : `Asignar ${draftList.length || ""} repuesto(s)`.replace(
                      "  ",
                      " ",
                    )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
