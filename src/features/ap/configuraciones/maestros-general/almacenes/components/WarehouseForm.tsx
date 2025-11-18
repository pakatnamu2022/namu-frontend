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
  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperation();

  const { data: classArticles = [], isLoading: isLoadingClassArticles } =
    useAllClassArticle();

  if (isLoadingSedes || isLoadingTypesOperation || isLoadingClassArticles)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una Sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
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
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
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
