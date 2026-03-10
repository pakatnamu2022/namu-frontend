import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { Plus, Trash2, Edit2, PackagePlus, Loader } from "lucide-react";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import EmptyState from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/EmptyState";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import {
  approvedAccesoriesSchemaCreate,
  ApprovedAccesoriesSchema,
} from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.schema";
import { useAllBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook";
import { storeApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { data: allCurrencyTypes = [] } = useAllCurrencyTypes();
  const [rows, setRows] = useState<ApprovedAccessoryRow[]>(initialData);

  // Modal para crear nuevo accesorio homologado (solo comercial)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: typesBody = [] } = useAllBodyType();
  const createForm = useForm<ApprovedAccesoriesSchema>({
    resolver: zodResolver(approvedAccesoriesSchemaCreate) as any,
    defaultValues: {
      code: "",
      description: "",
      price: 0,
      type_operation_id: 794,
    },
    mode: "onChange",
  });
  const { mutate: createAccessory, isPending: isCreatingAccessory } =
    useMutation({
      mutationFn: storeApprovedAccesories,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [APPROVED_ACCESSORIES.QUERY_KEY],
        });
        toast.success("Accesorio homologado creado correctamente");
        setIsCreateModalOpen(false);
        createForm.reset();
        setNewRow((prev) => ({ ...prev, accessory_id: data.id }));
        setIsAddSheetOpen(true);
      },
      onError: () => {
        toast.error("Error al crear el accesorio homologado");
      },
    });
  const [newRow, setNewRow] = useState<Omit<ApprovedAccessoryRow, "id">>({
    accessory_id: 0,
    quantity: 1,
    type: "ACCESORIO_ADICIONAL",
    additional_price: 0,
  });
  const [errors, setErrors] = useState({
    accessory_id: false,
    quantity: false,
  });
  const [editingRow, setEditingRow] = useState<ApprovedAccessoryRow | null>(
    null,
  );
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    accessory_id: 0,
    quantity: 1,
    type: "ACCESORIO_ADICIONAL" as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
    additional_price: 0,
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
      (row) => row.accessory_id === newRow.accessory_id,
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
      additional_price: 0,
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
      additional_price: row.additional_price ?? 0,
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
        row.accessory_id === editForm.accessory_id && row.id !== editingRow.id,
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
            additional_price: editForm.additional_price,
          }
        : row,
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
      additional_price: 0,
    });
    setEditErrors({
      accessory_id: false,
      quantity: false,
    });
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
  const convertToInvoiceCurrency = (subtotal: number, accessorySymbol?: string): number => {
    if (!getExchangeRate || !invoiceCurrencyId || !allCurrencyTypes.length) return subtotal;
    const accessoryCurrency = findCurrencyBySymbol(accessorySymbol);
    if (!accessoryCurrency || accessoryCurrency.id === invoiceCurrencyId) return subtotal;
    const tc = getExchangeRate(accessoryCurrency.id) / getExchangeRate(invoiceCurrencyId);
    return subtotal * tc;
  };

  // Calcular el total general convertido a la moneda de facturación (excluyendo obsequios)
  const calculateTotal = () => {
    return rows.reduce((total, row) => {
      if (row.type === "OBSEQUIO") return total;
      const subtotal = calculateSubtotal(row.accessory_id, row.quantity, row.additional_price);
      const accessory = accessories.find((acc) => acc.id === row.accessory_id);
      return total + convertToInvoiceCurrency(subtotal, accessory?.currency_symbol);
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
          (acc) => acc.id === row.original.accessory_id,
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

        const fromRate = getExchangeRate(accessoryCurrency.id);
        const toRate = getExchangeRate(invoiceCurrencyId);
        // tc: cuántas unidades de moneda destino equivalen a 1 unidad de moneda origen
        const tc = fromRate / toRate;
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
                        return allCurrencyTypes.find((c) => c.id === invoiceCurrencyId)?.symbol ?? "S/";
                      }
                      const firstAcc = rows
                        .filter((r) => r.type !== "OBSEQUIO")
                        .map((r) => accessories.find((a) => a.id === r.accessory_id))
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

        {/* Sheet para crear nuevo accesorio homologado (solo comercial) */}
        <GeneralSheet
          open={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            createForm.reset();
          }}
          title="Nuevo Accesorio Homologado"
          subtitle="Solo disponible para Comercial"
          icon="PackagePlus"
          size="lg"
        >
          <Form {...createForm}>
            <div className="space-y-4 px-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="code"
                  label="Código"
                  control={createForm.control}
                  placeholder="Ej: LS"
                  uppercase
                />
                <FormInput
                  name="description"
                  label="Descripción"
                  control={createForm.control}
                  placeholder="Ej: Láminas de Seguridad"
                  uppercase
                />
                <FormInput
                  name="price"
                  label="Precio"
                  control={createForm.control}
                  placeholder="Ej: 390"
                  type="number"
                />
                <FormSelect
                  name="body_type_id"
                  label="Carrocería"
                  placeholder="Selecciona una carrocería"
                  options={typesBody.map((item) => ({
                    label: item.code + " - " + item.description,
                    value: item.id.toString(),
                  }))}
                  control={createForm.control}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    createForm.reset();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={isCreatingAccessory}
                  onClick={createForm.handleSubmit((data) =>
                    createAccessory(data),
                  )}
                  className="flex-1"
                >
                  {isCreatingAccessory && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCreatingAccessory ? "Guardando..." : "Guardar Accesorio"}
                </Button>
              </div>
            </div>
          </Form>
        </GeneralSheet>

        {/* Sheet para actualizar accesorio/obsequio */}
        <GeneralSheet
          open={isAddSheetOpen}
          onClose={() => {
            setIsAddSheetOpen(false);
            setNewRow({
              accessory_id: 0,
              quantity: 1,
              type: "ACCESORIO_ADICIONAL",
              additional_price: 0,
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
            <SearchableSelect
              label="Tipo"
              value={newRow.type}
              onChange={(value) =>
                setNewRow({
                  ...newRow,
                  type: value as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
                })
              }
              options={[
                {
                  label: "Accesorio Adicional",
                  value: "ACCESORIO_ADICIONAL",
                },
                { label: "Obsequio", value: "OBSEQUIO" },
              ]}
              placeholder="Selecciona tipo"
              showSearch={false}
              allowClear={false}
            />

            <div>
              <div className="flex gap-2">
                <SearchableSelect
                  label="Accesorio"
                  value={
                    newRow.accessory_id === 0
                      ? ""
                      : newRow.accessory_id.toString()
                  }
                  onChange={(value) => {
                    setNewRow({ ...newRow, accessory_id: parseInt(value) });
                    setErrors({ ...errors, accessory_id: false });
                  }}
                  options={accessories.map((accessory) => ({
                    label: `${accessory.code} - ${accessory.description}`,
                    value: accessory.id.toString(),
                    description: accessory.type_operation,
                  }))}
                  placeholder="Selecciona un accesorio"
                  className={errors.accessory_id ? "border-red-500" : ""}
                  classNameDiv="flex-1"
                  withValue={false}
                />
                {canCreateApprovedAccessory && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Crear nuevo accesorio homologado (Solo Comercial)"
                    onClick={() => {
                      setIsAddSheetOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors.accessory_id && (
                <p className="text-xs text-red-500 mt-1">
                  Seleccione un accesorio válido
                </p>
              )}
            </div>

            <FormInput
              name="quantity"
              label="Cantidad"
              type="number"
              min="1"
              value={newRow.quantity || ""}
              onChange={(e) => {
                setNewRow({
                  ...newRow,
                  quantity: Number(e.target.value) || 0,
                });
                setErrors({ ...errors, quantity: false });
              }}
              placeholder="0"
              error={
                errors.quantity ? "Ingrese una cantidad mayor a 0" : undefined
              }
            />

            <FormInput
              name="additional_price"
              label={
                <>
                  Precio Adicional{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </>
              }
              type="number"
              min="0"
              step="0.01"
              value={newRow.additional_price ?? ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNewRow({
                  ...newRow,
                  additional_price: isNaN(val) || val < 0 ? 0 : val,
                });
              }}
              placeholder="0.00"
            />

            {/* Información del accesorio seleccionado */}
            {newRow.accessory_id > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedAccessory = accessories.find(
                    (acc) => acc.id === newRow.accessory_id,
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
                        {(newRow.additional_price ?? 0) > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-600">
                              Precio Efectivo Unit.:
                            </span>
                            <p className="font-medium text-primary">
                              {selectedAccessory.currency_symbol}{" "}
                              <NumberFormat
                                value={(
                                  Number(selectedAccessory.price) +
                                  (newRow.additional_price ?? 0)
                                ).toFixed(2)}
                              />
                            </p>
                          </div>
                        )}
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
                    additional_price: 0,
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
            <SearchableSelect
              label="Tipo"
              value={editForm.type}
              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  type: value as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
                })
              }
              options={[
                {
                  label: "Accesorio Adicional",
                  value: "ACCESORIO_ADICIONAL",
                },
                { label: "Obsequio", value: "OBSEQUIO" },
              ]}
              placeholder="Selecciona tipo"
              showSearch={false}
              allowClear={false}
            />

            <div>
              <SearchableSelect
                label="Accesorio"
                value={
                  editForm.accessory_id === 0
                    ? ""
                    : editForm.accessory_id.toString()
                }
                onChange={(value) => {
                  setEditForm({ ...editForm, accessory_id: parseInt(value) });
                  setEditErrors({ ...editErrors, accessory_id: false });
                }}
                options={accessories.map((accessory) => ({
                  label: `${accessory.code} - ${accessory.description}`,
                  value: accessory.id.toString(),
                }))}
                placeholder="Selecciona un accesorio"
                className={editErrors.accessory_id ? "border-red-500" : ""}
              />
              {editErrors.accessory_id && (
                <p className="text-xs text-red-500 mt-1">
                  Seleccione un accesorio válido
                </p>
              )}
            </div>

            <FormInput
              name="quantity"
              label="Cantidad"
              type="number"
              min="1"
              value={editForm.quantity || ""}
              onChange={(e) => {
                setEditForm({
                  ...editForm,
                  quantity: Number(e.target.value) || 0,
                });
                setEditErrors({ ...editErrors, quantity: false });
              }}
              placeholder="0"
              error={
                editErrors.quantity
                  ? "Ingrese una cantidad mayor a 0"
                  : undefined
              }
            />

            <FormInput
              name="additional_price"
              label={
                <>
                  Precio Adicional{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </>
              }
              type="number"
              min="0"
              step="0.01"
              value={editForm.additional_price ?? ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEditForm({
                  ...editForm,
                  additional_price: isNaN(val) || val < 0 ? 0 : val,
                });
              }}
              placeholder="0.00"
            />

            {/* Información del accesorio seleccionado */}
            {editForm.accessory_id > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const selectedAccessory = accessories.find(
                    (acc) => acc.id === editForm.accessory_id,
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
                        {(editForm.additional_price ?? 0) > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-600">
                              Precio Efectivo Unit.:
                            </span>
                            <p className="font-medium text-primary">
                              {selectedAccessory.currency_symbol}{" "}
                              <NumberFormat
                                value={(
                                  Number(selectedAccessory.price) +
                                  (editForm.additional_price ?? 0)
                                ).toFixed(2)}
                              />
                            </p>
                          </div>
                        )}
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
