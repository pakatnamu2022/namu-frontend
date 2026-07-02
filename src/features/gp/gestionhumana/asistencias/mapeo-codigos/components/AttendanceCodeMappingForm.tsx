"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  attendanceCodeMappingSchemaCreate,
  attendanceCodeMappingSchemaUpdate,
  AttendanceCodeMappingCreateSchema,
  AttendanceCodeMappingUpdateSchema,
} from "../lib/attendance-code-mapping.schema";
import { ATTENDANCE_CODE_MAPPING } from "../lib/attendance-code-mapping.constants";

const { MODEL } = ATTENDANCE_CODE_MAPPING;

type FormValues =
  | AttendanceCodeMappingCreateSchema
  | AttendanceCodeMappingUpdateSchema;

interface Props {
  isEdit: boolean;
  defaultValues: Partial<FormValues>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const AttendanceCodeMappingForm = ({
  isEdit,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(
      isEdit
        ? attendanceCodeMappingSchemaUpdate
        : attendanceCodeMappingSchemaCreate,
    ),
    defaultValues: {
      emp_code: "",
      vat: "",
      note: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            control={form.control}
            name="emp_code"
            label="Código del Dispositivo"
            placeholder="Ej: 7"
            required
          />

          <FormInput
            control={form.control}
            name="vat"
            label="DNI"
            placeholder="Ej: 26729421"
            required
          />

          <FormTextArea
            control={form.control}
            name="note"
            label="Nota"
            placeholder="Ej: Código mal registrado en el dispositivo"
            rows={3}
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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
