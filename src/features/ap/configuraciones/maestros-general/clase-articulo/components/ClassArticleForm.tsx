import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ClassArticleSchema,
  classArticleSchemaCreate,
  classArticleSchemaUpdate,
} from "../lib/classArticle.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllTypesOperation } from "../../tipos-operacion/lib/typesOperation.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { CLASS_ARTICLE } from "../lib/classArticle.constants";
import { FormInput } from "@/shared/components/FormInput";

interface ClassArticleFormProps {
  defaultValues: Partial<ClassArticleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ClassArticleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ClassArticleFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? classArticleSchemaCreate : classArticleSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { ABSOLUTE_ROUTE } = CLASS_ARTICLE;

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperation();

  if (isLoadingTypesOperation) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="dyn_code"
            label="Cod. Dynamics"
            placeholder="Ej: M_VEH_NUE"
          />

          <FormInput
            control={form.control}
            name="description"
            label="Descripción"
            placeholder="Ej: Vehiculos nuevos"
          />

          <FormInput
            control={form.control}
            name="account"
            label="Cuenta"
            placeholder="Ej: 20111111"
          />

          <FormSelect
            name="type_operation_id"
            label="Tipo de Operación"
            placeholder="Selecciona una Tipo"
            options={typesOperation.map((typeOperation) => ({
              label: typeOperation.description,
              value: typeOperation.id.toString(),
            }))}
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
            {isSubmitting ? "Guardando" : "Guardar Clase de Artículo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
