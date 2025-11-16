"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  importManageLeadsDerco,
  importManageLeadsSocialNetworks,
} from "../lib/manageLeads.actions";
import { ImportedLeadResource } from "../lib/manageLeads.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FileForm } from "@/shared/components/FileForm";
import { errorToast, successToast } from "@/core/core.function";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormValues {
  file: File | null;
  importType: string;
}

interface Props {
  onImportSuccess: (data: ImportedLeadResource[]) => void;
}

export function ManageLeadsForm({ onImportSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      file: null,
      importType: "derco",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Por favor seleccione un archivo");
      return;
    }

    if (!values.importType) {
      errorToast("Por favor seleccione el tipo de importación");
      return;
    }

    setIsLoading(true);
    try {
      const response =
        values.importType === "social"
          ? await importManageLeadsSocialNetworks(values.file)
          : await importManageLeadsDerco(values.file);

      if (response.success) {
        successToast(response.message || "Archivo importado exitosamente");
        onImportSuccess(response.data); // Llama al callback y cierra el modal
        form.reset();
      } else {
        errorToast(response.message || "Error al importar el archivo");
      }
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al importar el archivo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 py-2">
        <CardDescription>
          Selecciona el tipo de importación y sube un archivo Excel (.xlsx,
          .xls) o CSV con los datos de los leads
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="importType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Importación</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de importación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="derco">Derco</SelectItem>
                      <SelectItem value="social">Redes Sociales</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value } }) => (
                <FileForm
                  label="Archivo"
                  accept=".xlsx,.xls,.csv"
                  multiple={false}
                  value={value}
                  onChange={onChange}
                  disabled={isLoading}
                />
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !form.watch("file")}>
                {isLoading ? "Importando..." : "Importar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
