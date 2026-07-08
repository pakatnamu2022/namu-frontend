"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast } from "@/core/core.function";
import {
  updateVehiclesByVin,
  updatePurchaseOrderByVin,
} from "../lib/vehicles.actions";
import type {
  UpdateVehiclesByVinResponse,
  UpdatePurchaseOrderByVinResponse,
} from "../lib/vehicles.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  file: File | null;
}

interface UpdateResultPanelProps {
  result: { updated: number; rows_processed: number; errors: string[] };
  onReset: () => void;
  onClose: () => void;
}

function UpdateResultPanel({ result, onReset, onClose }: UpdateResultPanelProps) {
  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-3 rounded-lg p-3 ${
          result.errors.length === 0
            ? "bg-green-50 text-green-800"
            : "bg-amber-50 text-amber-800"
        }`}
      >
        {result.errors.length === 0 ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium">Actualización completada</p>
          <p className="mt-1 text-xs">
            Actualizados: {result.updated} · Filas procesadas:{" "}
            {result.rows_processed} · Errores: {result.errors.length}
          </p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <ul className="divide-y text-xs">
            {result.errors.map((err, i) => (
              <li key={i} className="px-3 py-2 text-red-600">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          Nueva actualización
        </Button>
        <Button size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}

function UpdateByVinForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UpdateVehiclesByVinResponse | null>(
    null
  );

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const reset = () => {
    setResult(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para actualizar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await updateVehiclesByVin(values.file);
      setResult(res);
      if (res.updated > 0) onSuccess?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al actualizar el archivo";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <UpdateResultPanel result={result} onReset={reset} onClose={reset} />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sube el Excel (.xlsx, .xls, .csv) con las columnas vin, motor y
          color para actualizar los vehículos existentes.
        </p>
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value } }) => (
            <FileForm
              label="Archivo Excel"
              accept=".xlsx,.xls,.csv"
              multiple={false}
              value={value}
              onChange={onChange}
              disabled={isLoading}
            />
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !form.watch("file")}
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function UpdatePurchaseOrderByVinForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] =
    useState<UpdatePurchaseOrderByVinResponse | null>(null);

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const reset = () => {
    setResult(null);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para actualizar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await updatePurchaseOrderByVin(values.file);
      setResult(res);
      if (res.updated > 0) onSuccess?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al actualizar el archivo";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <UpdateResultPanel result={result} onReset={reset} onClose={reset} />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sube el Excel (.xlsx, .xls, .csv) con las columnas vin, subtotal,
          igv y total para actualizar la orden de compra asociada a cada
          vehículo.
        </p>
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value } }) => (
            <FileForm
              label="Archivo Excel"
              accept=".xlsx,.xls,.csv"
              multiple={false}
              value={value}
              onChange={onChange}
              disabled={isLoading}
            />
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !form.watch("file")}
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function VehicleUpdateByVinSheet({
  open,
  onClose,
  onSuccess,
}: Props) {
  const handleClose = () => {
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Actualizar Vehículos por VIN"
      icon="FileUp"
      size="3xl"
    >
      <Tabs defaultValue="motor-color" className="w-full">
        <TabsList>
          <TabsTrigger value="motor-color">Motor y Color</TabsTrigger>
          <TabsTrigger value="orden-compra">Orden de Compra</TabsTrigger>
        </TabsList>
        <TabsContent value="motor-color">
          <UpdateByVinForm onSuccess={onSuccess} />
        </TabsContent>
        <TabsContent value="orden-compra">
          <UpdatePurchaseOrderByVinForm onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </GeneralSheet>
  );
}
