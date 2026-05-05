import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PackagePlus } from "lucide-react";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { DataTable } from "@/shared/components/DataTable";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CreateApprovedAccessoryModal } from "./CreateApprovedAccessoryModal";
import { AddAccessorySheet } from "./AddAccessorySheet";
import { EditAccessorySheet } from "./EditAccessorySheet";
import { getApprovedAccessoriesColumns } from "./approvedAccessoriesColumns";

export interface ApprovedAccessoryRow {
  id: string;
  accessory_id: number;
  quantity: number;
  type: "ACCESORIO_ADICIONAL" | "OBSEQUIO";
  additional_price?: number;
}

interface ApprovedAccessoriesTableProps {
  accessories: ApprovedAccesoriesResource[];
  onAccessoriesChange?: (accessories: ApprovedAccessoryRow[]) => void;
  initialData?: ApprovedAccessoryRow[];
  canCreateApprovedAccessory?: boolean;
  invoiceCurrencyId?: number;
  getExchangeRate?: (currencyId: number) => number;
}

export const ApprovedAccessoriesTable = ({
  accessories,
  onAccessoriesChange,
  initialData = [],
  canCreateApprovedAccessory = false,
  invoiceCurrencyId,
  getExchangeRate,
}: ApprovedAccessoriesTableProps) => {
  const { data: allCurrencyTypes = [] } = useAllCurrencyTypes();
  const [rows, setRows] = useState<ApprovedAccessoryRow[]>(initialData);

  // Modal para crear nuevo accesorio homologado (solo comercial)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingRow, setEditingRow] = useState<ApprovedAccessoryRow | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [pendingAccessoryId, setPendingAccessoryId] = useState<number | undefined>();

  // Effect para cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setRows(initialData);
      // Notificar al padre
      if (onAccessoriesChange) {
        onAccessoriesChange(initialData);
      }
    }
  }, [initialData]);

  const handleAdd = (data: Omit<ApprovedAccessoryRow, "id">) => {
    const newRow: ApprovedAccessoryRow = { ...data, id: Date.now().toString() };
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    if (onAccessoriesChange) onAccessoriesChange(updatedRows);
  };

  // Eliminar fila de la tabla
  const eliminarFila = (id: string) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onAccessoriesChange) {
      onAccessoriesChange(updatedRows);
    }
  };

  const abrirEditarFila = (row: ApprovedAccessoryRow) => {
    setEditingRow(row);
    setIsEditSheetOpen(true);
  };

  const handleEditSave = (data: Omit<ApprovedAccessoryRow, "id">) => {
    if (!editingRow) return;
    const updatedRows = rows.map((row) =>
      row.id === editingRow.id ? { ...row, ...data } : row,
    );
    setRows(updatedRows);
    if (onAccessoriesChange) onAccessoriesChange(updatedRows);
    setEditingRow(null);
    setIsEditSheetOpen(false);
  };

  // Calcular el subtotal de un accesorio: quantity * (price + additional_price)
  const calculateSubtotal = (
    accessory_id: number,
    quantity: number,
    additional_price: number = 0,
  ) => {
    const accessory = accessories.find((acc) => acc.id === accessory_id);
    if (!accessory) return 0;
    return (Number(accessory.price) + additional_price) * quantity;
  };

  // Busca la moneda en allCurrencyTypes usando símbolo o código (matching flexible)
  const findCurrencyBySymbol = (symbol?: string) => {
    const sym = symbol?.trim() ?? "";
    if (!sym) return undefined;
    return allCurrencyTypes.find(
      (c) =>
        c.symbol?.trim() === sym ||
        c.code?.trim() === sym ||
        sym.startsWith(c.symbol?.trim() ?? "") ||
        c.symbol?.startsWith(sym),
    );
  };

  // Convierte un subtotal de la moneda del accesorio a la moneda de facturación
  const convertToInvoiceCurrency = (
    subtotal: number,
    accessorySymbol?: string,
  ): number => {
    if (!getExchangeRate || !invoiceCurrencyId || !allCurrencyTypes.length)
      return subtotal;
    const accessoryCurrency = findCurrencyBySymbol(accessorySymbol);
    if (!accessoryCurrency || accessoryCurrency.id === invoiceCurrencyId)
      return subtotal;
    const tc =
      getExchangeRate(accessoryCurrency.id) /
      getExchangeRate(invoiceCurrencyId);
    return subtotal * tc;
  };

  // Calcular el total general convertido a la moneda de facturación (excluyendo obsequios)
  const calculateTotal = () => {
    return rows.reduce((total, row) => {
      if (row.type === "OBSEQUIO") return total;
      const subtotal = calculateSubtotal(
        row.accessory_id,
        row.quantity,
        row.additional_price,
      );
      const accessory = accessories.find((acc) => acc.id === row.accessory_id);
      return (
        total + convertToInvoiceCurrency(subtotal, accessory?.currency_symbol)
      );
    }, 0);
  };

  const columns = getApprovedAccessoriesColumns({
    accessories,
    allCurrencyTypes,
    invoiceCurrencyId,
    getExchangeRate,
    calculateSubtotal,
    findCurrencyBySymbol,
    onEdit: abrirEditarFila,
    onDelete: eliminarFila,
  });

  return (
    <GroupFormSection
      title="Accesorios Homologados / Obsequios"
      icon={PackagePlus}
      color="gray"
      cols={{ sm: 1 }}
      headerExtra={
        <Button
          type="button"
          onClick={() => setIsAddSheetOpen(true)}
          variant="default"
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Agregar Accesorio / Obsequio
        </Button>
      }
    >
      <div className="space-y-4 col-span-full">
        {/* DataTable de accesorios agregados */}
        {rows.length > 0 ? (
          <div>
            <DataTable
              columns={columns}
              data={rows}
              isVisibleColumnFilter={false}
              variant="ghost"
            />

            {/* Total general */}
            <div className="bg-gray-50 px-4 py-2 mt-1 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-sm text-gray-600">
                    Accesorios agregados:
                  </span>
                  <span className="ml-2 font-medium">{rows.length}</span>
                </div>
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-gray-600">
                    Total Accesorios:
                  </span>
                  <span className="ml-2 text-lg font-bold text-primary">
                    {(() => {
                      if (invoiceCurrencyId && allCurrencyTypes.length) {
                        return (
                          allCurrencyTypes.find(
                            (c) => c.id === invoiceCurrencyId,
                          )?.symbol ?? "S/"
                        );
                      }
                      const firstAcc = rows
                        .filter((r) => r.type !== "OBSEQUIO")
                        .map((r) =>
                          accessories.find((a) => a.id === r.accessory_id),
                        )
                        .find(Boolean);
                      return firstAcc?.currency_symbol ?? "S/";
                    })()}{" "}
                    <NumberFormat value={calculateTotal().toFixed(2)} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title={`No hay accesorios o obsequios agregados`}
            description="Agrega accesorios adicionales u obsequios a la cotización."
            icon={PackagePlus}
          />
        )}

        {/* Modal para crear nuevo accesorio homologado (solo comercial) */}
        <CreateApprovedAccessoryModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(accessoryId) => {
            setPendingAccessoryId(accessoryId);
            setIsAddSheetOpen(true);
          }}
        />

        {/* Sheet para agregar accesorio/obsequio */}
        <AddAccessorySheet
          open={isAddSheetOpen}
          onClose={() => {
            setIsAddSheetOpen(false);
            setPendingAccessoryId(undefined);
          }}
          onAdd={handleAdd}
          accessories={accessories}
          existingRows={rows}
          canCreateApprovedAccessory={canCreateApprovedAccessory}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          initialAccessoryId={pendingAccessoryId}
        />

        {/* Sheet para editar accesorio/obsequio */}
        <EditAccessorySheet
          open={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setEditingRow(null);
          }}
          onSave={handleEditSave}
          editingRow={editingRow}
          accessories={accessories}
          rows={rows}
        />
      </div>
    </GroupFormSection>
  );
};
