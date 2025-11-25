import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Plus, Trash2 } from "lucide-react";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { NumberFormat } from "@/shared/components/NumberFormat";

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

    // Si hay errores, no agregar
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

  return (
    <div className="space-y-4 col-span-full">
      {/* Formulario para agregar nueva fila */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white border rounded-lg">
        <div className="w-full md:w-48">
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

        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Accesorio</label>
          <Select
            value={
              newRow.accessory_id === 0 ? "" : newRow.accessory_id.toString()
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
                <SelectItem key={accessory.id} value={accessory.id.toString()}>
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

        <div className="w-full md:w-32">
          <label className="text-sm font-medium mb-1 block">Cantidad</label>
          <Input
            type="number"
            min="1"
            value={newRow.quantity || ""}
            onChange={(e) => {
              setNewRow({ ...newRow, quantity: parseInt(e.target.value) || 0 });
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

      {/* Tabla de accesorios agregados */}
      {rows.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const accessory = accessories.find(
                  (acc) => acc.id === row.accessory_id
                );
                if (!accessory) return null;

                const subtotal = calculateSubtotal(
                  row.accessory_id,
                  row.quantity
                );

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {accessory.code}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          row.type === "OBSEQUIO"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-primary"
                        }`}
                      >
                        {row.type === "OBSEQUIO"
                          ? "Obsequio"
                          : "Accesorio Adicional"}
                      </span>
                    </TableCell>
                    <TableCell>{accessory.description}</TableCell>
                    <TableCell className="text-right">
                      {accessory.currency_symbol}{" "}
                      <NumberFormat
                        value={Number(accessory.price).toFixed(2)}
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {row.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {row.type === "OBSEQUIO" ? (
                        <span className="text-green-600">0</span>
                      ) : (
                        `${accessory.currency_symbol} ${Number(
                          subtotal
                        ).toFixed(2)}`
                      )}
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

          {/* Total general */}
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">
                  Accesorios agregados:
                </span>
                <span className="ml-2 font-medium">{rows.length}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Accesorios:</span>
                <span className="ml-2 text-lg font-bold text-primary">
                  S/
                  <NumberFormat value={calculateTotal().toFixed(2)} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
          No hay accesorios agregados.
        </div>
      )}
    </div>
  );
};
