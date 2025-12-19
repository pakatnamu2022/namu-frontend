"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, Check, ChevronsUpDown, Edit2 } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { cn } from "@/lib/utils";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";

export interface BonusDiscountRow {
  id: string;
  concept_id: string;
  descripcion: string;
  isPercentage: boolean;
  valor: number;
  isNegative: boolean;
}

interface BonusDiscountTableProps {
  conceptsOptions: ConceptDiscountBondResource[];
  costoReferencia?: number;
  currencySymbol?: string;
  onRowsChange?: (rows: BonusDiscountRow[]) => void;
  title?: string;
  initialData?: BonusDiscountRow[];
}

export const BonusDiscountTable = ({
  conceptsOptions,
  costoReferencia = 50000,
  currencySymbol = "S/",
  onRowsChange,
  title = "Bonos / Descuentos",
  initialData = [],
}: BonusDiscountTableProps) => {
  const BONO_FINANCIERO_ID = "862";
  const BONO_MARCA_ID = "861";
  const DESCUENTO_NUEVO_ID = "863";

  const [rows, setRows] = useState<BonusDiscountRow[]>(initialData);
  const [newRow, setNewRow] = useState<Omit<BonusDiscountRow, "id">>({
    concept_id: "",
    descripcion: "",
    isPercentage: false,
    valor: 0,
    isNegative: false,
  });
  const [errors, setErrors] = useState({
    concept_id: false,
    descripcion: false,
    valor: false,
  });
  const [openCombobox, setOpenCombobox] = useState(false);
  const [editingRow, setEditingRow] = useState<BonusDiscountRow | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    concept_id: "",
    descripcion: "",
    isPercentage: false,
    valor: 0,
    isNegative: false,
  });
  const [editErrors, setEditErrors] = useState({
    concept_id: false,
    descripcion: false,
    valor: false,
  });
  const [openEditCombobox, setOpenEditCombobox] = useState(false);

  // Función para obtener las opciones de descripción según el concepto
  const getDescriptionOptions = (conceptId: string): string[] | null => {
    if (conceptId === BONO_FINANCIERO_ID) {
      return ["MARCA", "BANCO", "AP"];
    }
    if (conceptId === BONO_MARCA_ID) {
      return [
        "BONO NCP",
        "BONO ESPECIAL",
        "PLAN NORTE",
        "BONO ADICIONAL (DERCO)",
      ];
    }
    return null; // null significa campo libre de texto
  };

  // Limpiar descripción cuando cambia el concepto (evitar loop)
  // Y auto-marcar isNegative si es DESCUENTO_NUEVO_ID
  const [previousConceptId, setPreviousConceptId] = useState("");
  useEffect(() => {
    if (newRow.concept_id && newRow.concept_id !== previousConceptId) {
      const isNegativeDiscount = newRow.concept_id === DESCUENTO_NUEVO_ID;
      setNewRow((prev) => ({
        ...prev,
        descripcion: "",
        isNegative: isNegativeDiscount
      }));
      setPreviousConceptId(newRow.concept_id);
    }
  }, [newRow.concept_id, previousConceptId, DESCUENTO_NUEVO_ID]);

  // Auto-actualizar isNegative en el formulario de edición cuando cambia el concepto
  const [previousEditConceptId, setPreviousEditConceptId] = useState("");
  useEffect(() => {
    if (editForm.concept_id && editForm.concept_id !== previousEditConceptId) {
      const isNegativeDiscount = editForm.concept_id === DESCUENTO_NUEVO_ID;
      setEditForm((prev) => ({
        ...prev,
        isNegative: isNegativeDiscount
      }));
      setPreviousEditConceptId(editForm.concept_id);
    }
  }, [editForm.concept_id, previousEditConceptId, DESCUENTO_NUEVO_ID]);

  // Effect para cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setRows(initialData);
      // Notificar al padre
      if (onRowsChange) {
        onRowsChange(initialData);
      }
    }
  }, [initialData]);

  // Calcular descuento total
  const calcularDescuentoTotal = () => {
    const costo = Number(costoReferencia) || 0;
    return rows.reduce((total, row) => {
      const valor = row.isPercentage ? (costo * row.valor) / 100 : row.valor;
      // Si es negativo, resta; si no, suma
      return row.isNegative ? total - valor : total + valor;
    }, 0);
  };

  // Agregar nueva fila a la tabla
  const agregarFila = () => {
    // Validar campos
    const newErrors = {
      concept_id: !newRow.concept_id,
      descripcion: !newRow.descripcion,
      valor: newRow.valor <= 0,
    };

    setErrors(newErrors);

    // Si hay errores, no agregar
    if (newErrors.concept_id || newErrors.descripcion || newErrors.valor) {
      return;
    }

    const nuevaFila: BonusDiscountRow = {
      ...newRow,
      id: Date.now().toString(),
    };

    const updatedRows = [...rows, nuevaFila];
    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onRowsChange) {
      onRowsChange(updatedRows);
    }

    // Resetear el formulario y errores
    setNewRow({
      concept_id: "",
      descripcion: "",
      isPercentage: false,
      valor: 0,
      isNegative: false,
    });
    setErrors({
      concept_id: false,
      descripcion: false,
      valor: false,
    });

    // Cerrar el sheet
    setIsAddSheetOpen(false);
  };

  // Eliminar fila de la tabla
  const eliminarFila = (id: string) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onRowsChange) {
      onRowsChange(updatedRows);
    }
  };

  // Abrir el sheet para editar una fila
  const abrirEditarFila = (row: BonusDiscountRow) => {
    setEditingRow(row);
    setEditForm({
      concept_id: row.concept_id,
      descripcion: row.descripcion,
      isPercentage: row.isPercentage,
      valor: row.valor,
      isNegative: row.isNegative,
    });
    setEditErrors({
      concept_id: false,
      descripcion: false,
      valor: false,
    });
    // Actualizar el previousEditConceptId para que el useEffect funcione correctamente
    setPreviousEditConceptId(row.concept_id);
    setIsEditSheetOpen(true);
  };

  // Guardar cambios de edición
  const guardarEdicion = () => {
    // Validar campos
    const newErrors = {
      concept_id: !editForm.concept_id,
      descripcion: !editForm.descripcion,
      valor: editForm.valor <= 0,
    };

    setEditErrors(newErrors);

    // Si hay errores, no guardar
    if (newErrors.concept_id || newErrors.descripcion || newErrors.valor) {
      return;
    }

    if (!editingRow) return;

    // Actualizar la fila
    const updatedRows = rows.map((row) =>
      row.id === editingRow.id
        ? {
            ...row,
            concept_id: editForm.concept_id,
            descripcion: editForm.descripcion,
            isPercentage: editForm.isPercentage,
            valor: editForm.valor,
            isNegative: editForm.isNegative,
          }
        : row
    );

    setRows(updatedRows);

    // Notificar al padre si hay callback
    if (onRowsChange) {
      onRowsChange(updatedRows);
    }

    // Cerrar el sheet
    cerrarEditSheet();
  };

  // Cerrar el sheet de edición
  const cerrarEditSheet = () => {
    setIsEditSheetOpen(false);
    setEditingRow(null);
    setEditForm({
      concept_id: "",
      descripcion: "",
      isPercentage: false,
      valor: 0,
      isNegative: false,
    });
    setEditErrors({
      concept_id: false,
      descripcion: false,
      valor: false,
    });
    // Resetear el previousEditConceptId
    setPreviousEditConceptId("");
  };

  // Definición de columnas para DataTable
  const columns: ColumnDef<BonusDiscountRow>[] = [
    {
      accessorKey: "concept_id",
      header: "Concepto",
      cell: ({ getValue }) => {
        const conceptId = getValue() as string;
        const conceptLabel = conceptsOptions.find(
          (c) => c.id.toString() === conceptId
        )?.description || conceptId;
        return <span className="font-medium">{conceptLabel}</span>;
      },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
    },
    {
      accessorKey: "isPercentage",
      header: "Tipo",
      cell: ({ getValue }) => {
        const isPercentage = getValue() as boolean;
        return <span className="text-right">{isPercentage ? "Porcentaje" : "Fijo"}</span>;
      },
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => {
        const isPercentage = row.original.isPercentage;
        const valor = row.original.valor;
        return (
          <span className="text-right">
            {isPercentage
              ? `${valor}%`
              : `${currencySymbol} ${valor.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      id: "descuento",
      header: "Descuento",
      cell: ({ row }) => {
        const { isPercentage, valor, isNegative } = row.original;
        const costo = Number(costoReferencia) || 0;
        const descuentoCalculado = isPercentage
          ? (costo * valor) / 100
          : valor;

        return (
          <span className={`text-right font-medium ${isNegative ? 'text-red-600' : 'text-primary'}`}>
            {isNegative ? '- ' : ''}{currencySymbol}{" "}
            <NumberFormat value={descuentoCalculado.toFixed(2)} />
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        return (
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
        );
      },
    },
  ];

  return (
    <div className="space-y-4 col-span-full">
      {/* Botón para abrir el sheet de agregar */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setIsAddSheetOpen(true)}
          variant="default"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Bono / Descuento
        </Button>
      </div>

      {/* Tabla de bonos y descuentos usando DataTable */}
      {rows.length > 0 ? (
        <div className="space-y-0">
          <DataTable
            columns={columns}
            data={rows}
            variant="outline"
            isVisibleColumnFilter={false}
          />

          {/* Total de descuentos */}
          <div className="bg-gray-50 px-4 py-3 border border-t-0 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">Precio de Venta:</span>
                <span className="ml-2 font-medium">
                  {currencySymbol}{" "}
                  <NumberFormat
                    value={(Number(costoReferencia) || 0).toFixed(2)}
                  />
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Descuento:</span>
                <span className="ml-2 text-lg font-bold text-primary">
                  {currencySymbol}{" "}
                  <NumberFormat value={calcularDescuentoTotal().toFixed(2)} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
          No hay {title.toLowerCase()} agregados.
        </div>
      )}

      {/* Sheet para agregar bono/descuento */}
      <GeneralSheet
        open={isAddSheetOpen}
        onClose={() => {
          setIsAddSheetOpen(false);
          setNewRow({
            concept_id: "",
            descripcion: "",
            isPercentage: false,
            valor: 0,
            isNegative: false,
          });
          setErrors({
            concept_id: false,
            descripcion: false,
            valor: false,
          });
        }}
        title="Agregar Bono / Descuento"
        subtitle="Agrega un nuevo bono o descuento a la cotización"
        icon="Gift"
        size="lg"
      >
        <div className="space-y-4 px-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Concepto</label>
            <Select
              value={newRow.concept_id}
              onValueChange={(value) => {
                setNewRow({ ...newRow, concept_id: value });
                setErrors({ ...errors, concept_id: false });
              }}
            >
              <SelectTrigger
                className={errors.concept_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona un concepto" />
              </SelectTrigger>
              <SelectContent>
                {conceptsOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.concept_id && (
              <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descripción</label>
            {(() => {
              const options = getDescriptionOptions(newRow.concept_id);

              if (options) {
                return (
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        size="lg"
                        aria-expanded={openCombobox}
                        className={cn(
                          "w-full justify-between",
                          errors.descripcion && "border-red-500"
                        )}
                      >
                        {newRow.descripcion || "Ingrese descripción"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar o escribir..."
                          value={newRow.descripcion}
                          onValueChange={(value) => {
                            setNewRow({ ...newRow, descripcion: value });
                            setErrors({ ...errors, descripcion: false });
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                No se encontraron resultados.
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {options.map((option) => (
                              <CommandItem
                                key={option}
                                value={option}
                                onSelect={(currentValue) => {
                                  setNewRow({
                                    ...newRow,
                                    descripcion: currentValue.toUpperCase(),
                                  });
                                  setErrors({ ...errors, descripcion: false });
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newRow.descripcion === option
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Input
                  value={newRow.descripcion}
                  onChange={(e) => {
                    setNewRow({ ...newRow, descripcion: e.target.value });
                    setErrors({ ...errors, descripcion: false });
                  }}
                  placeholder="Ingrese descripción"
                  className={errors.descripcion ? "border-red-500" : ""}
                />
              );
            })()}
            {errors.descripcion && (
              <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select
                value={newRow.isPercentage ? "PORCENTAJE" : "FIJO"}
                onValueChange={(value) =>
                  setNewRow({ ...newRow, isPercentage: value === "PORCENTAJE" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIJO">Fijo</SelectItem>
                  <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Valor</label>
              <Input
                type="number"
                value={newRow.valor || ""}
                onChange={(e) => {
                  setNewRow({ ...newRow, valor: parseFloat(e.target.value) || 0 });
                  setErrors({ ...errors, valor: false });
                }}
                placeholder="0.00"
                step="0.01"
                className={errors.valor ? "border-red-500" : ""}
              />
              {errors.valor && (
                <p className="text-xs text-red-500 mt-1">
                  Ingrese un valor mayor a 0
                </p>
              )}
            </div>
          </div>

          {/* Vista previa del cálculo */}
          {newRow.valor > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-primary">
                  Vista Previa
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Precio de Venta:</span>
                    <p className="font-medium">
                      {currencySymbol} {costoReferencia.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monto {newRow.isNegative ? 'Descuento' : 'Bono'}:</span>
                    <p className={`font-medium ${newRow.isNegative ? 'text-red-600' : 'text-primary'}`}>
                      {newRow.isNegative ? '- ' : ''}{currencySymbol}{" "}
                      {newRow.isPercentage
                        ? ((costoReferencia * newRow.valor) / 100).toLocaleString("es-PE", { minimumFractionDigits: 2 })
                        : newRow.valor.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {newRow.concept_id === DESCUENTO_NUEVO_ID && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                    <p className="text-xs text-red-800 font-medium">
                      Este descuento afectará el precio final del vehículo
                    </p>
                  </div>
                )}
              </div>
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
                  concept_id: "",
                  descripcion: "",
                  isPercentage: false,
                  valor: 0,
                  isNegative: false,
                });
                setErrors({
                  concept_id: false,
                  descripcion: false,
                  valor: false,
                });
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={agregarFila}
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </div>
      </GeneralSheet>

      {/* Sheet para editar bono/descuento */}
      <GeneralSheet
        open={isEditSheetOpen}
        onClose={cerrarEditSheet}
        title="Editar Bono / Descuento"
        subtitle="Modifica los datos del bono o descuento seleccionado"
        icon="Edit2"
        size="lg"
      >
        <div className="space-y-4 px-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Concepto</label>
            <Select
              value={editForm.concept_id}
              onValueChange={(value) => {
                setEditForm({ ...editForm, concept_id: value });
                setEditErrors({ ...editErrors, concept_id: false });
              }}
            >
              <SelectTrigger
                className={editErrors.concept_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona un concepto" />
              </SelectTrigger>
              <SelectContent>
                {conceptsOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editErrors.concept_id && (
              <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descripción</label>
            {(() => {
              const options = getDescriptionOptions(editForm.concept_id);

              if (options) {
                return (
                  <Popover open={openEditCombobox} onOpenChange={setOpenEditCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        size="lg"
                        aria-expanded={openEditCombobox}
                        className={cn(
                          "w-full justify-between",
                          editErrors.descripcion && "border-red-500"
                        )}
                      >
                        {editForm.descripcion || "Ingrese descripción"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar o escribir..."
                          value={editForm.descripcion}
                          onValueChange={(value) => {
                            setEditForm({ ...editForm, descripcion: value });
                            setEditErrors({ ...editErrors, descripcion: false });
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                No se encontraron resultados.
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {options.map((option) => (
                              <CommandItem
                                key={option}
                                value={option}
                                onSelect={(currentValue) => {
                                  setEditForm({
                                    ...editForm,
                                    descripcion: currentValue.toUpperCase(),
                                  });
                                  setEditErrors({ ...editErrors, descripcion: false });
                                  setOpenEditCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    editForm.descripcion === option
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Input
                  value={editForm.descripcion}
                  onChange={(e) => {
                    setEditForm({ ...editForm, descripcion: e.target.value });
                    setEditErrors({ ...editErrors, descripcion: false });
                  }}
                  placeholder="Ingrese descripción"
                  className={editErrors.descripcion ? "border-red-500" : ""}
                />
              );
            })()}
            {editErrors.descripcion && (
              <p className="text-xs text-red-500 mt-1">Este campo es requerido</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select
                value={editForm.isPercentage ? "PORCENTAJE" : "FIJO"}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, isPercentage: value === "PORCENTAJE" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIJO">Fijo</SelectItem>
                  <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Valor</label>
              <Input
                type="number"
                value={editForm.valor || ""}
                onChange={(e) => {
                  setEditForm({ ...editForm, valor: parseFloat(e.target.value) || 0 });
                  setEditErrors({ ...editErrors, valor: false });
                }}
                placeholder="0.00"
                step="0.01"
                className={editErrors.valor ? "border-red-500" : ""}
              />
              {editErrors.valor && (
                <p className="text-xs text-red-500 mt-1">
                  Ingrese un valor mayor a 0
                </p>
              )}
            </div>
          </div>

          {/* Vista previa del cálculo */}
          {editForm.valor > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-primary">
                  Vista Previa
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Precio de Venta:</span>
                    <p className="font-medium">
                      {currencySymbol} {costoReferencia.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monto {editForm.isNegative ? 'Descuento' : 'Bono'}:</span>
                    <p className={`font-medium ${editForm.isNegative ? 'text-red-600' : 'text-primary'}`}>
                      {editForm.isNegative ? '- ' : ''}{currencySymbol}{" "}
                      {editForm.isPercentage
                        ? ((costoReferencia * editForm.valor) / 100).toLocaleString("es-PE", { minimumFractionDigits: 2 })
                        : editForm.valor.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                {editForm.concept_id === DESCUENTO_NUEVO_ID && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                    <p className="text-xs text-red-800 font-medium">
                      Este descuento afectará el precio final del vehículo
                    </p>
                  </div>
                )}
              </div>
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
            <Button
              type="button"
              onClick={guardarEdicion}
              className="flex-1"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </GeneralSheet>
    </div>
  );
};
