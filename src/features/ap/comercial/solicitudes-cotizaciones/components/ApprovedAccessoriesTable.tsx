import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, PackagePlus } from "lucide-react";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";
import { GroupFormSection } from "@/shared/components/GroupFormSection";

export interface ApprovedAccessoryRow {
  id: string;
  accessory_id: number;
  quantity: number;
  type: "ACCESORIO_ADICIONAL" | "OBSEQUIO";
}

interface ApprovedAccessoriesTableProps {
  accessories: ApprovedAccesoriesResource[];
  onAccessoriesChange?: (accessories: ApprovedAccessoryRow[]) => void;
  initialData?: ApprovedAccessoryRow[];
}

export const ApprovedAccessoriesTable = ({
  accessories,
  onAccessoriesChange,
  initialData = [],
}: ApprovedAccessoriesTableProps) => {
  const [rows, setRows] = useState<ApprovedAccessoryRow[]>(initialData);
  const [newRow, setNewRow] = useState<Omit<ApprovedAccessoryRow, "id">>({
    accessory_id: 0,
    quantity: 1,
    type: "ACCESORIO_ADICIONAL",
  });
  const [errors, setErrors] = useState({
    accessory_id: false,
    quantity: false,
  });
  const [editingRow, setEditingRow] = useState<ApprovedAccessoryRow | null>(
    null
  );
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    accessory_id: 0,
    quantity: 1,
    type: "ACCESORIO_ADICIONAL" as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
  });
  const [editErrors, setEditErrors] = useState({
    accessory_id: false,
    quantity: false,
  });

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

  // Agregar nueva fila a la tabla
  const agregarFila = () => {
    // Validar campos
    const newErrors = {
      accessory_id: !newRow.accessory_id || newRow.accessory_id === 0,
      quantity: newRow.quantity <= 0,
    };

    setErrors(newErrors);

    // Si hay errores, no actualizar
    if (newErrors.accessory_id || newErrors.quantity) {
      return;
    }

    // Verificar si el accesorio ya fue agregado
    const yaExiste = rows.find(
      (row) => row.accessory_id === newRow.accessory_id
    );
    if (yaExiste) {
      setErrors({ ...errors, accessory_id: true });
      return;
    }

    const nuevaFila: ApprovedAccessoryRow = {
      ...newRow,
      id: Date.now().toString(),
    };

    const updatedRows = [...rows, nuevaFila];
    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onAccessoriesChange) {
      onAccessoriesChange(updatedRows);
    }

    // Resetear el formulario y errores
    setNewRow({
      accessory_id: 0,
      quantity: 1,
      type: "ACCESORIO_ADICIONAL",
    });
    setErrors({
      accessory_id: false,
      quantity: false,
    });

    // Cerrar el sheet
    setIsAddSheetOpen(false);
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

  // Abrir el sheet para editar una fila
  const abrirEditarFila = (row: ApprovedAccessoryRow) => {
    setEditingRow(row);
    setEditForm({
      accessory_id: row.accessory_id,
      quantity: row.quantity,
      type: row.type,
    });
    setEditErrors({
      accessory_id: false,
      quantity: false,
    });
    setIsEditSheetOpen(true);
  };

  // Guardar cambios de edición
  const guardarEdicion = () => {
    // Validar campos
    const newErrors = {
      accessory_id: !editForm.accessory_id || editForm.accessory_id === 0,
      quantity: editForm.quantity <= 0,
    };

    setEditErrors(newErrors);

    // Si hay errores, no guardar
    if (newErrors.accessory_id || newErrors.quantity) {
      return;
    }

    if (!editingRow) return;

    // Verificar si el accesorio ya existe en otra fila
    const yaExiste = rows.find(
      (row) =>
        row.accessory_id === editForm.accessory_id && row.id !== editingRow.id
    );
    if (yaExiste) {
      setEditErrors({ ...editErrors, accessory_id: true });
      return;
    }

    // Actualizar la fila
    const updatedRows = rows.map((row) =>
      row.id === editingRow.id
        ? {
            ...row,
            accessory_id: editForm.accessory_id,
            quantity: editForm.quantity,
            type: editForm.type,
          }
        : row
    );

    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onAccessoriesChange) {
      onAccessoriesChange(updatedRows);
    }

    // Cerrar el sheet
    cerrarEditSheet();
  };

  // Cerrar el sheet de edición
  const cerrarEditSheet = () => {
    setIsEditSheetOpen(false);
    setEditingRow(null);
    setEditForm({
      accessory_id: 0,
      quantity: 1,
      type: "ACCESORIO_ADICIONAL",
    });
    setEditErrors({
      accessory_id: false,
      quantity: false,
    });
  };

  // Calcular el subtotal de un accesorio
  const calculateSubtotal = (accessory_id: number, quantity: number) => {
    const accessory = accessories.find((acc) => acc.id === accessory_id);
    if (!accessory) return 0;
    return Number(accessory.price) * quantity;
  };

  // Calcular el total general (excluyendo obsequios)
  const calculateTotal = () => {
    return rows.reduce((total, row) => {
      // Solo sumar si NO es un obsequio
      if (row.type === "OBSEQUIO") {
        return total;
      }
      return total + calculateSubtotal(row.accessory_id, row.quantity);
    }, 0);
  };

  // Definir columnas para DataTable
  const columns: ColumnDef<ApprovedAccessoryRow>[] = [
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
          {row.original.type === "OBSEQUIO"
            ? "Obsequio"
            : "Accesorio Adicional"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const accessory = accessories.find(
          (acc) => acc.id === row.original.accessory_id
        );
        return accessory ? (
          <div className="space-y-1">
            <p className="font-medium text-sm">{accessory.description}</p>
            <div className="flex gap-3 text-xs text-gray-600">
              <span>
                Código:{" "}
                <span className="font-medium text-gray-800">
                  {accessory.code}
                </span>
              </span>
              <span>
                Precio:{" "}
                <span className="font-medium text-gray-800">
                  {accessory.currency_symbol}{" "}
                  <NumberFormat value={Number(accessory.price).toFixed(2)} />
                </span>
              </span>
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
          (acc) => acc.id === row.original.accessory_id
        );
        const subtotal = calculateSubtotal(
          row.original.accessory_id,
          row.original.quantity
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
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => abrirEditarFila(row.original)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => eliminarFila(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <GroupFormSection
      title="Accesorios Homologados / Obsequios"
      icon={PackagePlus}
      iconColor="text-gray-500"
      bgColor="bg-gray-50"
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
                    S/ <NumberFormat value={calculateTotal().toFixed(2)} />
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

        {/* Sheet para actualizar accesorio/obsequio */}
        <GeneralSheet
          open={isAddSheetOpen}
          onClose={() => {
            setIsAddSheetOpen(false);
            setNewRow({
              accessory_id: 0,
              quantity: 1,
              type: "ACCESORIO_ADICIONAL",
            });
            setErrors({
              accessory_id: false,
              quantity: false,
            });
          }}
          title="Agregar Accesorio / Obsequio"
          subtitle="Agrega un nuevo accesorio o obsequio a la cotización"
          icon="PackagePlus"
          size="lg"
        >
          <div className="space-y-4 px-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select
                value={newRow.type}
                onValueChange={(value) =>
                  setNewRow({
                    ...newRow,
                    type: value as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCESORIO_ADICIONAL">
                    Accesorio Adicional
                  </SelectItem>
                  <SelectItem value="OBSEQUIO">Obsequio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Accesorio
              </label>
              <Select
                value={
                  newRow.accessory_id === 0
                    ? ""
                    : newRow.accessory_id.toString()
                }
                onValueChange={(value) => {
                  setNewRow({ ...newRow, accessory_id: parseInt(value) });
                  setErrors({ ...errors, accessory_id: false });
                }}
              >
                <SelectTrigger
                  className={errors.accessory_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona un accesorio" />
                </SelectTrigger>
                <SelectContent>
                  {accessories.map((accessory) => (
                    <SelectItem
                      key={accessory.id}
                      value={accessory.id.toString()}
                    >
                      {accessory.code} - {accessory.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accessory_id && (
                <p className="text-xs text-red-500 mt-1">
                  Seleccione un accesorio válido
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={newRow.quantity || ""}
                onChange={(e) => {
                  setNewRow({
                    ...newRow,
                    quantity: parseInt(e.target.value) || 0,
                  });
                  setErrors({ ...errors, quantity: false });
                }}
                placeholder="0"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-1">
                  Ingrese una cantidad mayor a 0
                </p>
              )}
            </div>

            {/* Información del accesorio seleccionado */}
            {newRow.accessory_id > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedAccessory = accessories.find(
                    (acc) => acc.id === newRow.accessory_id
                  );
                  if (!selectedAccessory) return null;

                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-primary">
                        Información del Accesorio
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Código:</span>
                          <p className="font-medium">
                            {selectedAccessory.code}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Precio Unit.:</span>
                          <p className="font-medium">
                            {selectedAccessory.currency_symbol}{" "}
                            <NumberFormat
                              value={Number(selectedAccessory.price).toFixed(2)}
                            />
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Descripción:</span>
                          <p className="font-medium">
                            {selectedAccessory.description}
                          </p>
                        </div>
                        {newRow.type === "OBSEQUIO" && (
                          <div className="col-span-2 mt-2 p-2 bg-green-100 border border-green-300 rounded">
                            <p className="text-xs text-green-800 font-medium">
                              Este artículo será marcado como obsequio y no se
                              sumará al total
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddSheetOpen(false);
                  setNewRow({
                    accessory_id: 0,
                    quantity: 1,
                    type: "ACCESORIO_ADICIONAL",
                  });
                  setErrors({
                    accessory_id: false,
                    quantity: false,
                  });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="button" onClick={agregarFila} className="flex-1">
                Agregar
              </Button>
            </div>
          </div>
        </GeneralSheet>

        {/* Sheet para editar accesorio/obsequio */}
        <GeneralSheet
          open={isEditSheetOpen}
          onClose={cerrarEditSheet}
          title="Editar Accesorio / Obsequio"
          subtitle="Modifica los datos del accesorio o obsequio seleccionado"
          icon="Edit2"
          size="lg"
        >
          <div className="space-y-4 px-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select
                value={editForm.type}
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    type: value as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCESORIO_ADICIONAL">
                    Accesorio Adicional
                  </SelectItem>
                  <SelectItem value="OBSEQUIO">Obsequio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Accesorio
              </label>
              <Select
                value={
                  editForm.accessory_id === 0
                    ? ""
                    : editForm.accessory_id.toString()
                }
                onValueChange={(value) => {
                  setEditForm({ ...editForm, accessory_id: parseInt(value) });
                  setEditErrors({ ...editErrors, accessory_id: false });
                }}
              >
                <SelectTrigger
                  className={editErrors.accessory_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona un accesorio" />
                </SelectTrigger>
                <SelectContent>
                  {accessories.map((accessory) => (
                    <SelectItem
                      key={accessory.id}
                      value={accessory.id.toString()}
                    >
                      {accessory.code} - {accessory.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.accessory_id && (
                <p className="text-xs text-red-500 mt-1">
                  Seleccione un accesorio válido
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={editForm.quantity || ""}
                onChange={(e) => {
                  setEditForm({
                    ...editForm,
                    quantity: parseInt(e.target.value) || 0,
                  });
                  setEditErrors({ ...editErrors, quantity: false });
                }}
                placeholder="0"
                className={editErrors.quantity ? "border-red-500" : ""}
              />
              {editErrors.quantity && (
                <p className="text-xs text-red-500 mt-1">
                  Ingrese una cantidad mayor a 0
                </p>
              )}
            </div>

            {/* Información del accesorio seleccionado */}
            {editForm.accessory_id > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedAccessory = accessories.find(
                    (acc) => acc.id === editForm.accessory_id
                  );
                  if (!selectedAccessory) return null;

                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-primary">
                        Información del Accesorio
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Código:</span>
                          <p className="font-medium">
                            {selectedAccessory.code}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Precio Unit.:</span>
                          <p className="font-medium">
                            {selectedAccessory.currency_symbol}{" "}
                            <NumberFormat
                              value={Number(selectedAccessory.price).toFixed(2)}
                            />
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Descripción:</span>
                          <p className="font-medium">
                            {selectedAccessory.description}
                          </p>
                        </div>
                        {editForm.type === "OBSEQUIO" && (
                          <div className="col-span-2 mt-2 p-2 bg-green-100 border border-green-300 rounded">
                            <p className="text-xs text-green-800 font-medium">
                              Este artículo será marcado como obsequio y no se
                              sumará al total
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={cerrarEditSheet}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="button" onClick={guardarEdicion} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </GeneralSheet>
      </div>
    </GroupFormSection>
  );
};
