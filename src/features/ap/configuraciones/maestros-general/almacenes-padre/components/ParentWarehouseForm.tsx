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
import { PARENT_WAREHOUSE } from "../lib/parentWarehouse.constants";
import {
  ParentWarehouseSchema,
  parentWarehouseSchemaCreate,
  parentWarehouseSchemaUpdate,
} from "../lib/parentWarehouse.schema";

interface ParentWarehouseFormProps {
  defaultValues: Partial<ParentWarehouseSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ParentWarehouseForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ParentWarehouseFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? parentWarehouseSchemaCreate
        : parentWarehouseSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = PARENT_WAREHOUSE;
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
