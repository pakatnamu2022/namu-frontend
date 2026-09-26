"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Download, Loader } from "lucide-react";
import { BONUS } from "../lib/bonus.constant";
import {
  BonusImportSchema,
  bonusImportSchema,
} from "../lib/bonus.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FileForm } from "@/shared/components/FileForm";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useGpMasters } from "@/features/gp/gp-master/lib/gpMaster.hook";
import { GP_MASTER_TYPE } from "@/features/gp/gp-master/lib/gpMaster.constants";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { Option } from "@/core/core.interface";
import { currentMonth, currentYear } from "@/core/core.function";
import BonusTemplateDialog from "./BonusTemplateDialog";

interface BonusImportFormProps {
  companyId: string;
  onSubmit: (data: BonusImportSchema, file: File, companyId: string) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const BonusImportForm = ({
  companyId,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: BonusImportFormProps) => {
  const { MODEL } = BONUS;
  const [file, setFile] = useState<File | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [showTemplate, setShowTemplate] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useAllCompanies();

  const form = useForm<BonusImportSchema>({
    resolver: zodResolver(bonusImportSchema) as any,
    defaultValues: {
      type_id: undefined,
    },
    mode: "onChange",
  });

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
  };

  const { data: gpMastersData } = useGpMasters({
    params: { type: GP_MASTER_TYPE.PAYROLL_BUNESES },
  });

  const typeOptions: Option[] = (gpMastersData?.data ?? []).map((item) => ({
    label: item.description,
    value: String(item.id),
  }));

  const handleSubmit = (data: BonusImportSchema) => {
    if (!file) return;
    onSubmit(data, file, selectedCompanyId);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Empresa</label>
          <SearchableSelect
            options={(companies ?? []).map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            placeholder={isLoadingCompanies ? "Cargando..." : "Empresa"}
            disabled={isLoadingCompanies}
            allowClear={false}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
          <div>
            <p className="text-sm font-medium">¿No tienes la plantilla?</p>
            <p className="text-xs text-muted-foreground">
              Matriz: una fila por trabajador y una columna por cada mes que
              elijas, así puedes cargar varios periodos en un solo archivo.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => setShowTemplate(true)}
            disabled={!selectedCompanyId}
          >
            <Download className="size-4 mr-1.5" />
            Descargar plantilla
          </Button>
        </div>

        <FormSelect
          name="type_id"
          label="Tipo de bono"
          placeholder="Seleccione tipo"
          options={typeOptions}
          control={form.control}
          required
        />

        <FormField
          control={form.control}
          name="type_id"
          render={() => (
            <FileForm
              label="Archivo Excel"
              accept=".xlsx,.xls"
              multiple={false}
              value={file}
              onChange={(f) => setFile(f as File | null)}
            />
          )}
        />

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid || !file}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Importando..." : `Importar ${MODEL.name}`}
          </Button>
        </div>
      </form>

      <BonusTemplateDialog
        open={showTemplate}
        onClose={() => setShowTemplate(false)}
        companyId={selectedCompanyId}
        defaultYear={currentYear()}
        defaultMonth={currentMonth()}
      />
    </Form>
  );
};
