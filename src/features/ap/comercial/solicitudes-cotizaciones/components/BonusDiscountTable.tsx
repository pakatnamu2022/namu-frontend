import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { ConceptDiscountBondResource } from "../lib/purchaseRequestQuote.interface";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { cn } from "@/lib/utils";

export interface BonusDiscountRow {
  id: string;
  concept_id: string;
  descripcion: string;
  isPercentage: boolean;
  valor: number;
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

  const [rows, setRows] = useState<BonusDiscountRow[]>(initialData);
  const [newRow, setNewRow] = useState<Omit<BonusDiscountRow, "id">>({
    concept_id: "",
    descripcion: "",
    isPercentage: false,
    valor: 0,
  });
  const [errors, setErrors] = useState({
    concept_id: false,
    descripcion: false,
    valor: false,
  });
  const [openCombobox, setOpenCombobox] = useState(false);

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
  const [previousConceptId, setPreviousConceptId] = useState("");
  useEffect(() => {
    if (newRow.concept_id && newRow.concept_id !== previousConceptId) {
      setNewRow((prev) => ({ ...prev, descripcion: "" }));
      setPreviousConceptId(newRow.concept_id);
    }
  }, [newRow.concept_id, previousConceptId]);

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
      if (row.isPercentage) {
        return total + (costo * row.valor) / 100;
      }
      return total + row.valor;
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
    });
    setErrors({
      concept_id: false,
      descripcion: false,
      valor: false,
    });
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

  return (
    <div className="space-y-4 col-span-full">
      {/* Formulario para agregar nueva fila */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white border rounded-lg">
        <div className="flex-1">
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
              <SelectValue placeholder="Selecciona" />
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

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Descripción</label>
          {(() => {
            const options = getDescriptionOptions(newRow.concept_id);

            // Si hay opciones predefinidas, mostrar Combobox (seleccionar o escribir)
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

            // Si no hay opciones, mostrar Input normal
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

        <div className="w-full md:w-40">
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

        <div className="w-full md:w-32">
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

        <div className="pt-0 md:pt-6">
          <Button
            type="button"
            onClick={agregarFila}
            variant="default"
            className="shrink-0 w-full h-10 md:w-10 md:h-10"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2 md:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Tabla de bonos y descuentos */}
      {rows.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const conceptLabel =
                  conceptsOptions.find(
                    (c) => c.id.toString() === row.concept_id
                  )?.description || row.concept_id;
                const costo = Number(costoReferencia) || 0;
                const descuentoCalculado = row.isPercentage
                  ? (costo * row.valor) / 100
                  : row.valor;

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {conceptLabel}
                    </TableCell>
                    <TableCell>{row.descripcion}</TableCell>
                    <TableCell className="text-right">
                      {row.isPercentage ? "Porcentaje" : "Fijo"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.isPercentage
                        ? `${row.valor}%`
                        : `${currencySymbol} ${row.valor.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {currencySymbol}{" "}
                      <NumberFormat value={descuentoCalculado.toFixed(2)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarFila(row.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Total de descuentos */}
          <div className="bg-gray-50 px-4 py-3 border-t">
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
      )}

      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
          No hay {title.toLowerCase()} agregados.
        </div>
      )}
    </div>
  );
};
