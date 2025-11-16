"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HierarchicalCategoryResource } from "../../categorias-jerarquicas/lib/hierarchicalCategory.interface";
import { useCycle } from "../lib/cycle.hook";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

const schema = z.object({
  categories: z.array(z.string()),
});

export type CycleCategoryDetailFormType = z.infer<typeof schema>;

interface Props {
  id: number;
  categories: HierarchicalCategoryResource[];
  defaultValue?: CycleCategoryDetailFormType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CycleCategoryDetailFormType) => Promise<void>;
}

export default function CycleCategoryDetailForm({
  id,
  categories,
  defaultValue,
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const form = useForm<CycleCategoryDetailFormType>({
    resolver: zodResolver(schema),
    defaultValues: defaultValue ?? { categories: [] },
  });

  const { data: cycle } = useCycle(id);

  useEffect(() => {
    if (defaultValue) {
      form.reset(defaultValue);
    }
  }, [defaultValue]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, categories]);

  const allSelected = filteredCategories
    .filter((cat) => cat.pass)
    .every((cat) => form.watch("categories").includes(String(cat.id)));

  const partiallySelected =
    filteredCategories.some((cat) =>
      form.watch("categories").includes(String(cat.id))
    ) && !allSelected;

  const toggleAll = () => {
    const current = form.watch("categories");
    // Solo incluir los que tienen pass en true
    const filteredIds = filteredCategories
      .filter((c) => c.pass)
      .map((c) => String(c.id));
    if (allSelected) {
      form.setValue(
        "categories",
        current.filter((id) => !filteredIds.includes(id))
      );
    } else {
      const unique = Array.from(new Set([...current, ...filteredIds]));
      form.setValue("categories", unique);
    }
  };

  useEffect(() => {
    if (cycle) {
      const validIds = new Set(categories.map((c) => String(c.id)));
      const mapped = cycle.categories
        .map((cat) => String(cat.hierarchical_category_id))
        .filter((id) => validIds.has(id));

      form.reset({ categories: mapped });
    }
  }, [cycle, categories]);

  const handleSubmit = async () => {
    setLoading(true);
    const data = form.getValues();
    await onSubmit(data);
    setLoading(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-auto">
        <SheetHeader>
          <SheetTitle>
            {cycle ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Agregar Participantes
                </p>
                <p className="font-semibold text-primary">{cycle.name}</p>
              </>
            ) : (
              <Skeleton className="h-6 w-1/2" />
            )}
          </SheetTitle>
          <SheetDescription className="hidden" />
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <Input
            placeholder="Buscar categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Form {...form}>
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <div className="space-y-2">
                  <div
                    className={cn(
                      "border p-3 rounded-md flex items-center gap-3 cursor-pointer",
                      {
                        "bg-muted": partiallySelected,
                        "bg-primary/10": allSelected,
                      }
                    )}
                    onClick={toggleAll}
                  >
                    <Checkbox
                      className="rounded"
                      checked={
                        allSelected
                          ? true
                          : !partiallySelected
                          ? false
                          : "indeterminate"
                      }
                      onCheckedChange={toggleAll}
                    />
                    <span className="font-medium">Seleccionar todo</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <FormField
                        key={category.id}
                        name="categories"
                        render={({ field }) => {
                          const checked = field.value.includes(
                            String(category.id)
                          );
                          const toggle = () => {
                            if (checked) {
                              field.onChange(
                                field.value.filter(
                                  (id: any) => id !== String(category.id)
                                )
                              );
                            } else {
                              field.onChange([
                                ...field.value,
                                String(category.id),
                              ]);
                            }
                          };
                          return (
                            <FormItem
                              key={category.id}
                              className={cn(
                                "border p-3 rounded-md flex flex-col items-start justify-center gap-3 cursor-pointer",
                                !category.pass &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                              onClick={category.pass ? toggle : undefined} // evita click si está disabled
                            >
                              <FormControl className="flex items-center gap-2">
                                <FormLabel
                                  className={cn("mb-0", {
                                    "cursor-pointer": category.pass,
                                    "cursor-not-allowed pointer-events-none":
                                      !category.pass,
                                  })}
                                >
                                  <Checkbox
                                    disabled={!category.pass}
                                    className="mb-0 rounded"
                                    checked={checked}
                                    onCheckedChange={toggle}
                                  />
                                  {category.name}
                                </FormLabel>
                              </FormControl>
                              {!category.pass && category.issues && (
                                <FormMessage className="text-xs">
                                  {category.issues.map((issue, index) => (
                                    <li key={index}>{issue}</li>
                                  ))}
                                </FormMessage>
                              )}
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            />
          </Form>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader className="animate-spin h-4 w-4" /> : null}
            {loading ? "Asignando..." : "Confirmar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
