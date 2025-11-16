// components/ParameterDetailForm.tsx
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  definicion: z.string().optional(),
  level1: z.string().optional(),
  level2: z.string().optional(),
  level3: z.string().optional(),
  level4: z.string().optional(),
  level5: z.string().optional(),
});

export type SubCompetenceFormType = z.infer<typeof schema>;

interface Props {
  defaultValue?: SubCompetenceFormType;
  onSubmit: (data: SubCompetenceFormType) => void;
  onCancel?: () => void;
}

export default function SubCompetenceForm({
  defaultValue,
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<SubCompetenceFormType>({
    defaultValues: defaultValue ?? {
      nombre: "",
      definicion: "",
      level1: "",
      level2: "",
      level3: "",
      level4: "",
      level5: "",
    },
  });

  useEffect(() => {
    if (defaultValue) {
      form.reset(defaultValue);
    }
  }, [defaultValue]);

  const handleSave = () => {
    const data = form.getValues();
    onSubmit(data);
    form.reset();
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="max-h-[70vh] overflow-y-auto grid gap-4 p-1">
        <Input {...form.register("nombre")} placeholder="Nombre" autoFocus />
        <Input {...form.register("definicion")} placeholder="Definición" />
        <div className="grid md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div key={lvl} className="grid w-full items-center gap-3">
              <Label className="text-primary" htmlFor={`level${lvl}`}>
                Nivel {lvl}
              </Label>
              <Textarea
                rows={1}
                className="text-xs! md:min-h-40"
                id={`level${lvl}`}
                {...form.register(`level${lvl}` as keyof SubCompetenceFormType)}
                placeholder={`Nivel ${lvl}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="button" onClick={handleSave}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
