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
import { Loader, PackagePlus, Plus } from "lucide-react";
import TableSkeleton from "@/shared/components/TableSkeleton.tsx";
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
          Agregar productos al estante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buscador */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar producto por nombre o código..."
        />

        {/* Resultados de búsqueda */}
        <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} columns={2} />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No hay productos disponibles para agregar.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {row.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cód: {row.product?.code ?? "-"} · Stock: {row.quantity} ·
                    Disp: {row.available_quantity}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addToDraft(row)}
                >
                  <Plus className="size-4 mr-1" /> Agregar
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Productos seleccionados para asignar */}
        {draftList.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">
              Por asignar
              <Badge className="ml-2">{draftList.length}</Badge>
            </p>
            <div className="space-y-2">
              {draftList.map((d) => (
                <div
                  key={d.stockId}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-md bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {d.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cód: {d.productCode || "-"}
                    </p>
                  </div>
                  <Input
                    value={d.position}
                    onChange={(e) =>
                      setDraftPosition(d.stockId, e.target.value)
                    }
                    placeholder="Posición (ej: A1, Nivel 2)"
                    className="sm:w-48 h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeFromDraft(d.stockId)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={handleConfirm}
              disabled={isAssigning}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${
                  !isAssigning ? "hidden" : "animate-spin"
                }`}
              />
              {isAssigning
                ? "Asignando..."
                : `Asignar ${draftList.length} producto(s) al estante`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
