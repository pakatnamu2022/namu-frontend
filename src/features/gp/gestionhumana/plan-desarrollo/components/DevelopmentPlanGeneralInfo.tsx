"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormInput } from "@/shared/components/FormInput";
import { Label } from "@/components/ui/label";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";

interface DevelopmentPlanGeneralInfoProps {
  form: UseFormReturn<any>;
}

export default function DevelopmentPlanGeneralInfo({
  form,
}: DevelopmentPlanGeneralInfoProps) {
  return (
    <GroupFormSection
      title="Información General"
      icon={FileText}
      cols={{ sm: 1, md: 1, lg: 1 }}
      gap="gap-1"
    >
      <div className="col-span-full">
        <FormInput
          name="title"
          label="Título del Plan de Desarrollo"
          placeholder="Ingresa el título del plan..."
          value={form.watch("title")}
          onChange={(e) => form.setValue("title", e.target.value)}
          maxLength={255}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {form.watch("title").length}/255
        </p>
      </div>

      <div className="col-span-full space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe el plan de desarrollo..."
          value={form.watch("description")}
          onChange={(e) => form.setValue("description", e.target.value)}
          rows={4}
          maxLength={500}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {form.watch("description").length}/500
        </p>
      </div>

      <div className="col-span-full">
        <DateRangePickerFormField
          control={form.control}
          nameFrom="start_date"
          nameTo="end_date"
          label="Rango de Fechas"
          placeholder="Selecciona el rango de fechas"
        />
      </div>
    </GroupFormSection>
  );
}
