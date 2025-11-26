import {
  WarehouseSchema,
  warehouseSchemaCreate,
  warehouseSchemaUpdate,
} from "../lib/warehouse.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllTypesOperation } from "../../tipos-operacion/lib/typesOperation.hook";
import { useAllClassArticle } from "../../clase-articulo/lib/classArticle.hook";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { WAREHOUSE } from "../lib/warehouse.constants";
import { useEffect, useRef } from "react";
import { useAllWarehouse } from "../lib/warehouse.hook";

interface WarehouseFormProps {
  defaultValues: Partial<WarehouseSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const WarehouseForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: WarehouseFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? warehouseSchemaCreate : warehouseSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = WAREHOUSE;
  const hasLoadedInitialData = useRef(false);
  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperation();

  const { data: classArticles = [], isLoading: isLoadingClassArticles } =
    useAllClassArticle();

  const isReceivedWatch = form.watch("is_received");
  const idParentWarehouseWatch = form.watch("is_physical_warehouse");
  const parentWarehouseIdWatch = form.watch("parent_warehouse_id");

  const { data: parentWarehouses = [], isLoading: isLoadingParentWarehouses } =
    useAllWarehouse({
      is_received: isReceivedWatch ? 1 : 0,
      is_physical_warehouse: 1,
    });

  useEffect(() => {
    // En modo edición, saltar solo la primera carga para mantener valores originales
    if (mode === "update" && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      return;
    }

    // Después de la primera carga, ejecutar auto-llenado en ambos modos
    if (isReceivedWatch && parentWarehouseIdWatch !== "") {
      const parentWarehouse = parentWarehouses.find(
        (pw) => pw.id.toString() === parentWarehouseIdWatch
      );

      if (parentWarehouse) {
        form.setValue("sede_id", parentWarehouse.sede_id.toString());
        form.setValue(
          "type_operation_id",
          parentWarehouse.type_operation_id.toString()
        );
      }
    }
  }, [mode, isReceivedWatch, parentWarehouseIdWatch, form, parentWarehouses]);

  if (isLoadingSedes || isLoadingTypesOperation || isLoadingClassArticles)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSwitch
            name="is_physical_warehouse"
            label="¿Es Padre?"
            text={form.watch("is_physical_warehouse") ? "Sí" : "No"}
            control={form.control}
          />
          <FormField
            control={form.control}
            name="dyn_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod. Dynamic</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: EXR-SU-TUM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: EXI. POR REC. SUMINISTROS TUM."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!idParentWarehouseWatch && (
            <>
              <FormField
                control={form.control}
                name="inventory_account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuenta de Inventario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2011112" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="counterparty_account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuenta de Contrapartida</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 0211111" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSelect
                name="article_class_id"
                label="Clase de Artículo"
                placeholder="Selecciona una Clase de Artículo"
                options={classArticles.map((classArticle) => ({
                  label: classArticle.description,
                  value: classArticle.id.toString(),
                }))}
                control={form.control}
              />
              <FormSwitch
                name="is_received"
                label="¿Es Almacén de Recepción?"
                text={form.watch("is_received") ? "Sí" : "No"}
                control={form.control}
              />
              <FormSelect
                name="parent_warehouse_id"
                label="Almacén Padre"
                placeholder="Selecciona un Almacén Padre"
                options={parentWarehouses.map((parentWarehouse) => ({
                  label: parentWarehouse.dyn_code,
                  description:
                    parentWarehouse.sede +
                    " - " +
                    parentWarehouse.type_operation,
                  value: parentWarehouse.id.toString(),
                }))}
                control={form.control}
                disabled={
                  isLoadingParentWarehouses || parentWarehouses.length === 0
                }
                withValue={false}
              />
            </>
          )}
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una Sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
            disabled={parentWarehouseIdWatch !== "" && !idParentWarehouseWatch}
          />
          <FormSelect
            name="type_operation_id"
            label="Tipo de Operación"
            placeholder="Selecciona una Tipo de Operación"
            options={typesOperation.map((typeOperation) => ({
              label: typeOperation.description,
              value: typeOperation.id.toString(),
            }))}
            control={form.control}
            disabled={parentWarehouseIdWatch !== "" && !idParentWarehouseWatch}
          />
          {idParentWarehouseWatch && (
            <FormSwitch
              name="is_received"
              label="¿Es Almacén de Recepción?"
              text={form.watch("is_received") ? "Sí" : "No"}
              control={form.control}
            />
          )}
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Almacén"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
