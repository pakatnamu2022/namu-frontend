import { useForm } from "react-hook-form";
import {
  ShopSchema,
  shopSchemaCreate,
  shopSchemaUpdate,
} from "../lib/shop.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/shared/components/Tags";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, CheckIcon } from "lucide-react";
import { useAllAvailableLocationsShop } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EMPRESA_AP } from "@/core/core.constants";
import { ShopSedeResource } from "../lib/shop.interface";

interface ShopFormProps {
  defaultValues: Partial<ShopSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const ShopForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ShopFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? shopSchemaCreate : shopSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: sedes = [], isLoading: isLoadingSedes } =
    useAllAvailableLocationsShop({
      empresa_id: EMPRESA_AP.id,
    });

  if (isLoadingSedes) {
    return <FormSkeleton />;
  }

  const handleSubmit = (data: any) => {
    const formattedData = {
      ...data,
      sedes: data.sedes.map((sede: ShopSedeResource) => sede.id),
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Pakatnamu Chiclayo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de selección multiple */}
          <FormField
            control={form.control}
            name="sedes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sedes</FormLabel>
                <FormControl>
                  <Tags
                    className="max-w-full"
                    value={field.value ?? []}
                    setValue={field.onChange}
                  >
                    <TagsTrigger placeholder="Selecciona las sedes">
                      {(field.value ?? []).map((sede: ShopSedeResource) => (
                        <TagsValue
                          key={sede.id}
                          onRemove={() =>
                            field.onChange(
                              (field.value ?? []).filter(
                                (a: { id: number }) => a.id !== sede.id
                              )
                            )
                          }
                        >
                          {sede.abreviatura}
                        </TagsValue>
                      ))}
                    </TagsTrigger>
                    <TagsContent>
                      <TagsInput placeholder="Buscar sede..." />
                      <TagsList>
                        <TagsEmpty>No se encontro Sede.</TagsEmpty>
                        <TagsGroup>
                          {sedes.map((sede) => (
                            <TagsItem
                              key={sede.id}
                              onSelect={() => {
                                if (
                                  !(field.value ?? []).some(
                                    (a: { id: number }) => a.id === sede.id
                                  )
                                ) {
                                  field.onChange([
                                    ...(field.value ?? []),
                                    sede,
                                  ]);
                                }
                              }}
                              value={sede.abreviatura}
                            >
                              {sede.abreviatura}
                              {(field.value ?? []).some(
                                (a: { id: number }) => a.id === sede.id
                              ) && (
                                <CheckIcon
                                  className="text-muted-foreground"
                                  size={14}
                                />
                              )}
                            </TagsItem>
                          ))}
                        </TagsGroup>
                      </TagsList>
                    </TagsContent>
                  </Tags>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Tienda"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
