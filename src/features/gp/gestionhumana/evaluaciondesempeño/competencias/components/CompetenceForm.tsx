"use client";

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
import { Loader, Plus } from "lucide-react";
import { Link } from 'react-router-dom'
import { useState } from "react";
import {
  CompetenceSchema,
  competenceSchemaCreate,
  competenceSchemaUpdate,
} from "../lib/competence.schema";
import SubCompetenceList from "./SubCompetenceList";
import SubCompetenceForm, { SubCompetenceFormType } from "./SubCompetenceForm";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SUBCOMPETENCE } from "../lib/subcompetence.constans";

const { MODEL } = SUBCOMPETENCE;

interface CompetenceFormProps {
  defaultValues: Partial<CompetenceSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CompetenceForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CompetenceFormProps) => {
  const form = useForm<CompetenceSchema>({
    resolver: zodResolver(
      mode === "create" ? competenceSchemaCreate : competenceSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      subCompetences: defaultValues.subCompetences ?? [],
    },
    mode: "onChange",
  });

  const {
    fields: subFields,
    append,
    remove,
    update,
  } = useFieldArray({
    control: form.control,
    name: "subCompetences",
  });

  const [openSheet, setOpenSheet] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function normalizeSubCompetence(input: any) {
    return {
      ...input,
      definicion: input.definicion ?? "",
      level1: input.level1 ?? "",
      level2: input.level2 ?? "",
      level3: input.level3 ?? "",
      level4: input.level4 ?? "",
      level5: input.level5 ?? "",
    };
  }

  const handleSubSubmit = (data: SubCompetenceFormType) => {
    if (editIndex !== null) {
      update(editIndex, data);
    } else {
      append(data);
    }
    setEditIndex(null);
    setOpenSheet(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full formlayout"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la competencia</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Productividad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcompetencias */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-primary font-medium text-sm">Subcompetencias</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditIndex(null);
                setOpenSheet(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            <SubCompetenceList
              items={subFields}
              onEdit={(index) => {
                setEditIndex(index);
                setOpenSheet(true);
              }}
              onDelete={remove}
            />
          </div>
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
            {isSubmitting ? "Guardando" : "Guardar Competencia"}
          </Button>
        </div>
      </form>

      <GeneralModal
        open={openSheet}
        onClose={() => {
          setEditIndex(null);
          setOpenSheet(false);
        }}
        title={`${editIndex !== null ? "Editar " : "Nueva "} ${MODEL.name}`}
        maxWidth="!max-w-(--breakpoint-lg)"
      >
        <SubCompetenceForm
          defaultValue={
            editIndex !== null
              ? normalizeSubCompetence(
                  form.getValues(`subCompetences.${editIndex}`)
                )
              : undefined
          }
          onSubmit={handleSubSubmit}
          onCancel={() => {
            setEditIndex(null);
            setOpenSheet(false);
          }}
        />
      </GeneralModal>
    </Form>
  );
};
