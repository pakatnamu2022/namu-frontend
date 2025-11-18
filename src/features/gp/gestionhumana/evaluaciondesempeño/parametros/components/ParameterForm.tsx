// components/ParameterForm.tsx
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import {
  parameterSchemaCreate,
  parameterSchemaUpdate,
  type ParameterSchema,
  type ParameterDetailSchema,
  ParameterCreateSchema,
  ParameterUpdateSchema,
} from "../lib/parameter.schema";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PARAMETER,
  PARAMETER_SCALES,
  PARAMETER_TYPES,
} from "../lib/parameter.constans";
import { FormSelect } from "@/shared/components/FormSelect";
import { useFormContext } from "react-hook-form";
import { getScales } from "../lib/parameter.hook";

type Mode = "create" | "update";
const DEFAULT_MAX = 100 as const;

interface Props {
  defaultValues?: Partial<ParameterSchema>;
  onSubmit: (data: ParameterCreateSchema | ParameterUpdateSchema) => void;
  isSubmitting?: boolean;
  mode?: Mode;
}

export default function ParameterForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: Props) {
  const { ABSOLUTE_ROUTE } = PARAMETER;
  const initialCount = defaultValues?.details?.length
    ? String(defaultValues.details.length)
    : "4";

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? parameterSchemaCreate : (parameterSchemaUpdate as any)
    ),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: "objectives",
      detailsCount: initialCount,
      details: defaultValues?.details?.length
        ? normalizeChain(defaultValues.details)
        : partitionRanges(Number(initialCount), DEFAULT_MAX),
      ...defaultValues,
    } as any,
  });

  const { control, watch, handleSubmit, setValue, getValues, trigger } = form;
  const { fields, replace } = useFieldArray({ control, name: "details" });

  const detailsCount = watch("detailsCount");
  const type = watch("type");
  const countNum = Number(detailsCount || 0);
  const scales = getScales(countNum);

  // Repartir 0..100 cuando cambie la cantidad (regla solicitada)
  useEffect(() => {
    if (mode !== "create") return;

    const n = Number(detailsCount || 0);
    if (!n) return;

    replace(
      partitionRanges(
        n,
        type === "competences" ? n : DEFAULT_MAX,
        type === "competences"
      )
    );
    trigger(["details"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsCount, type, mode]);

  // Editar libremente 'to', encadenando 'from' siguientes; validación se encarga de errores
  const handleToChange = (idx: number, raw: string) => {
    setValue(`details.${idx}.to`, raw === "" ? ("" as any) : toNumber(raw), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    const len = getValues("details").length;
    for (let i = idx + 1; i < len; i++) {
      const prevTo = (getValues(`details.${i - 1}.to`) as number) ?? 0;
      setValue(
        `details.${i}.from`,
        type !== "competences" ? prevTo : prevTo + 0.01,
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
    trigger([`details.${idx}.to`, `details.${idx}.from`, "details"]);
  };

  const onSave = (data: ParameterCreateSchema | ParameterUpdateSchema) =>
    onSubmit(data);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSave)}
        className="space-y-6 w-full formlayout"
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del parámetro</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Tipo"
            control={control}
            name="type"
            placeholder="Tipo de Parámetro"
            options={PARAMETER_TYPES}
          />

          <FormSelect
            label="Cantidad de rangos"
            control={control}
            name="detailsCount"
            placeholder="Cantidad de rangos"
            options={[
              { value: "4", label: "4" },
              { value: "5", label: "5" },
              { value: "6", label: "6" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <p className="text-primary font-medium text-sm">Detalles</p>

          <Table>
            <TableCaption className="text-xs">
              “Desde” se calcula del rango anterior. Escribe libremente; si hay
              errores, se mostrarán abajo.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Etiqueta</TableHead>
                <TableHead className="w-40">Desde</TableHead>
                <TableHead className="w-40">Hasta</TableHead>
                <TableHead className="w-28">Escala</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((row, idx) => {
                const scale = scales[idx] ?? PARAMETER_SCALES[0];
                return (
                  <TableRow key={row.id}>
                    <TableCell className="p-1">
                      <FormField
                        control={control}
                        name={`details.${idx}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`Etiqueta ${idx + 1}`}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>

                    <TableCell className="p-1">
                      <FormField
                        control={control}
                        name={`details.${idx}.from`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                value={field.value ?? 0}
                                readOnly
                                disabled
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>

                    <TableCell className="p-1">
                      <FormField
                        control={control}
                        name={`details.${idx}.to`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="numeric"
                                step="1"
                                readOnly={
                                  type === "competences" &&
                                  idx === fields.length - 1
                                }
                                disabled={
                                  type === "competences" &&
                                  idx === fields.length - 1
                                }
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  handleToChange(idx, e.target.value)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>

                    <TableCell className="align-center p-1">
                      <Badge
                        variant="ghost"
                        className={cn(
                          "font-medium px-2.5 py-1.5 rounded-md",
                          scale
                        )}
                      >
                        {`Nivel ${idx + 1}`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* errores del array (cantidad, encadenado, tope 120, etc.) */}
          <FormField
            control={control}
            name="details"
            render={() => (
              <FormItem>
                <DetailsErrors />
              </FormItem>
            )}
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
            <Loader className={cn("mr-2 h-4 w-4", !isSubmitting && "hidden")} />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/* helpers */
function partitionRanges(
  n: number,
  max: number,
  isCompetences: boolean = false
): ParameterDetailSchema[] {
  n = clamp(n, 1, 6);
  max = clamp(max, 1, 120);
  if (n === 1) return [{ label: "Nivel 1", from: 0, to: max }];
  const step = max / n;
  const arr: ParameterDetailSchema[] = [];
  for (let i = 0; i < n; i++) {
    let from: number;
    if (i === 0 && !isCompetences) {
      from = 0;
    } else if (i === 0 && isCompetences) {
      from = 1;
    } else if (isCompetences) {
      from = arr[i - 1].to + 0.01;
    } else {
      from = arr[i - 1].to;
    }
    const to = isCompetences
      ? Math.round(step * (i + 1))
      : i === n - 1
      ? max
      : Math.round(step * (i + 1));
    arr.push({ label: `Nivel ${i + 1}`, from, to });
  }
  arr[arr.length - 1].to = max;
  return arr;
}

function normalizeChain(details: ParameterDetailSchema[]) {
  if (!details?.length) return [];
  const out = details.map((d, i) => ({
    label: d.label?.trim() || `Nivel ${i + 1}`,
    from: Number.isFinite(d.from as any) ? (d.from as number) : 0,
    to: Number.isFinite(d.to as any) ? (d.to as number) : 0,
    id: d.id,
  }));
  out[0].from = 0;
  for (let i = 1; i < out.length; i++) out[i].from = out[i - 1].to;
  return out;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
function toNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : (NaN as any);
}

function DetailsErrors() {
  const {
    formState: { errors },
  } = useFormContext<any>();

  const msgs: string[] = [];

  const d = (errors as any)?.details;

  if (d?.message) msgs.push(d.message);

  if (Array.isArray(d)) {
    d.forEach((rowErr: any, i: number) => {
      if (!rowErr) return;
      const idx = `Nivel ${i + 1}`;
      if (typeof rowErr.message === "string")
        msgs.push(`${idx}: ${rowErr.message}`);
      if (rowErr.label?.message)
        msgs.push(`${idx} · Etiqueta: ${rowErr.label.message}`);
      if (rowErr.from?.message)
        msgs.push(`${idx} · Desde: ${rowErr.from.message}`);
      if (rowErr.to?.message) msgs.push(`${idx} · Hasta: ${rowErr.to.message}`);
      if (rowErr.root?.message) msgs.push(`${idx}: ${rowErr.root.message}`);
    });
  }

  if (msgs.length === 0) return null;

  return (
    <ul className="text-sm text-destructive list-disc pl-5 space-y-1">
      {Array.from(new Set(msgs)).map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>
  );
}
