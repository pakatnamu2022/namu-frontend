import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Image, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllBrandGroup } from "../../grupos-marcas/lib/brandGroup.hook";
import {
  brandSchemaCreate,
  brandSchemaUpdate,
  BrandsSchema,
} from "../lib/brands.schema";
import { BrandsRequest } from "../lib/brands.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface BrandsFormProps {
  defaultValues: Partial<BrandsSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BrandsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: BrandsFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? brandSchemaCreate : (brandSchemaUpdate as any)
    ),
    defaultValues: {
      ...defaultValues,
      is_commercial: defaultValues.is_commercial ?? true,
    },
    mode: "onChange",
  });

  const { data: brandGroups = [], isLoading: isLoadingbrandGroups } =
    useAllBrandGroup();

  const isCommercial = useWatch({
    control: form.control,
    name: "is_commercial",
    defaultValue: defaultValues.is_commercial ?? true,
  });

  // Establecer dyn_code a "-" cuando is_commercial es false
  useEffect(() => {
    if (isCommercial === false) {
      form.setValue("dyn_code", "-");
    }
  }, [isCommercial, form]);

  const handleSubmit = (data: BrandsRequest) => {
    onSubmit(data);
  };

  if (isLoadingbrandGroups) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: CHA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isCommercial && (
            <FormField
              control={form.control}
              name="dyn_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cod. Dynamics</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Changan" {...field} />
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
                  <Input placeholder="Ej: Changan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="group_id"
            label="Grupo"
            placeholder="Selecciona un grupo"
            options={
              brandGroups.map((brandGroup) => ({
                label: brandGroup.description,
                value: brandGroup.id.toString(),
              })) /* Replace with actual options */
            }
            control={form.control}
          />
          <FormField
            control={form.control}
            name="logo"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      className="pl-10"
                      {...field}
                    />
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo_min"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Logo Min</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      className="pl-10"
                      {...field}
                    />
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={mode === "create" ? "./" : "../"}>
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
            {isSubmitting ? "Guardando" : "Guardar Marca"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
