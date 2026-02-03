"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Package } from "lucide-react";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-tablet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface PartsManagementSectionProps {
  quotationId: number;
}

interface PartItem {
  id: number;
  part_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const partSchema = z.object({
  part_code: z.string().min(1, "El código es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  unit_price: z.number().min(0.01, "El precio debe ser mayor a 0"),
});

type PartFormData = z.infer<typeof partSchema>;

export default function PartsManagementSection({
  quotationId,
}: PartsManagementSectionProps) {
  const isTablet = useIsTablet();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      part_code: "",
      description: "",
      quantity: 1,
      unit_price: 0,
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unit_price");
  const calculatedTotal = quantity * unitPrice;

  // TODO: Replace with actual API call
  const { data: partItems = [], isLoading } = useQuery({
    queryKey: ["quotationParts", quotationId],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [] as PartItem[];
    },
    enabled: !!quotationId,
  });

  // TODO: Replace with actual API call
  const createMutation = useMutation({
    mutationFn: async (data: PartFormData) => {
      // Mock API call
      console.log("Creating part item:", data);
      return {
        id: Date.now(),
        ...data,
        total: data.quantity * data.unit_price,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotationParts", quotationId],
      });
      setIsSheetOpen(false);
      reset();
    },
  });

  // TODO: Replace with actual API call
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock API call
      console.log("Deleting part item:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotationParts", quotationId],
      });
      setItemToDelete(null);
    },
  });

  const onSubmit = (data: PartFormData) => {
    createMutation.mutate(data);
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando repuestos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Items de Repuestos</h3>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Repuesto
        </Button>
      </div>

      {/* Parts Items Table */}
      {partItems.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.part_code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.total)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay repuestos agregados
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Agrega repuestos o productos para esta cotización
            </p>
          </div>
        </Card>
      )}

      {/* Add Part Sheet */}
      <GeneralSheet
        open={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          reset();
        }}
        title="Agregar Repuesto"
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="part_code">
              Código del Repuesto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="part_code"
              placeholder="Ej: REP-001"
              {...register("part_code")}
              className={errors.part_code ? "border-red-500" : ""}
            />
            {errors.part_code && (
              <p className="text-sm text-red-500">{errors.part_code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descripción del repuesto o producto"
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                placeholder="1"
                {...register("quantity", { valueAsNumber: true })}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">
                Precio Unitario <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("unit_price", { valueAsNumber: true })}
                className={errors.unit_price ? "border-red-500" : ""}
              />
              {errors.unit_price && (
                <p className="text-sm text-red-500">
                  {errors.unit_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Calculado:
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(calculatedTotal || 0)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSheetOpen(false);
                reset();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Agregar"
              )}
            </Button>
          </div>
        </form>
      </GeneralSheet>

      {/* Delete Confirmation Dialog */}
      <SimpleDeleteDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
