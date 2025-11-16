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
import { Loader } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ClassArticleSchema,
  classArticleSchemaCreate,
  classArticleSchemaUpdate,
} from "../lib/classArticle.schema";
import { FormSelect } from "@/src/shared/components/FormSelect";

interface ClassArticleFormProps {
  defaultValues: Partial<ClassArticleSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const usoOptions = [
  {
    label: "Vehículo",
    value: "VEHICULO",
  },
  {
    label: "Post Venta",
    value: "POSTVENTA",
  },
];

export const ClassArticleForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ClassArticleFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? classArticleSchemaCreate : classArticleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

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
                <FormLabel>Cod. Dynamics</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: M_VEH_NUE" {...field} />
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
                  <Input placeholder="Ej: Vehiculos nuevos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 20111111" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="type"
            label="Tipo"
            placeholder="Selecciona su tipo"
            options={usoOptions}
            control={form.control}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link href={mode === "create" ? "" : "../"}>
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
