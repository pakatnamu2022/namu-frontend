"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader, Receipt, X, FileText } from "lucide-react";
import { useState } from "react";
import { SupportsSchema, supportsSchema } from "../lib/supports.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import {
  MultipleFileUploadWithCamera,
  UploadedFile,
} from "@/shared/components/MultipleFileUploadWithCamera";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { useMarketingConstants } from "@/features/ap/comercial/marketing/lib/marketingConstants.hook";
import { SUPPORT_TYPE_OPTIONS, SUPPORTS } from "../lib/supports.constants";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { ActivitiesResource } from "../../actividades/lib/activities.interface";
import { BUSINESS_PARTNER_TYPE } from "@/features/ap/business-partners/lib/businessPartners.constants";
import { BusinessPartnersResource } from "@/features/ap/business-partners/lib/businessPartners.interface";
import { useBusinessPartners } from "@/features/ap/business-partners/lib/businessPartners.hook";
import { SupportFileResource } from "../lib/supports.interface";

interface Props {
  defaultValues: Partial<SupportsSchema>;
  onSubmit: (data: SupportsSchema, files: File[]) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  /** Archivos ya guardados (modo edición): se pueden eliminar individualmente. */
  existingFiles?: SupportFileResource[];
  /** URL del archivo legado de un sustento antiguo (campo file_path, sin registro en `files`). */
  legacyFileUrl?: string | null;
  onDeleteExistingFile?: (fileId: number) => void;
  deletingFileId?: number | null;
}

export const SupportsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  existingFiles = [],
  legacyFileUrl,
  onDeleteExistingFile,
  deletingFileId,
}: Props) => {
  const form = useForm<SupportsSchema>({
    resolver: zodResolver(supportsSchema) as any,
    defaultValues,
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const maxNewFiles = Math.max(1, 10 - existingFiles.length);

  const { data: currencies = [] } = useAllCurrencyTypes();
  const { data: constants } = useMarketingConstants();
  const typeOptions = constants?.support_types ?? SUPPORT_TYPE_OPTIONS;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          onSubmit(data, files.map((f) => f.file)),
        )}
        className="space-y-6"
      >
        <GroupFormSection
          icon={Receipt}
          title="Información del Sustento"
          cols={{ sm: 1, md: 2 }}
        >
          <FormSelect
            name="type"
            label="Tipo de Sustento"
            placeholder="Selecciona un tipo"
            options={typeOptions}
            control={form.control}
            required
          />
          <FormSelectAsync
            name="activity_id"
            label="Actividad"
            placeholder="Selecciona una actividad"
            useQueryHook={useActivities}
            mapOptionFn={(activity: ActivitiesResource) => ({
              label: activity.name,
              value: activity.id.toString(),
            })}
            control={form.control}
          />
          <FormSelectAsync
            name="supplier_id"
            label="Proveedor"
            placeholder="Selecciona un proveedor"
            useQueryHook={useBusinessPartners}
            additionalParams={{
              type: [
                BUSINESS_PARTNER_TYPE.BOTH,
                BUSINESS_PARTNER_TYPE.SUPPLIER,
              ],
            }}
            mapOptionFn={(supplier: BusinessPartnersResource) => ({
              label: supplier.full_name,
              value: supplier.id.toString(),
              description: supplier.num_doc,
            })}
            control={form.control}
            required
          />
          <FormInput
            name="document_series"
            label="Serie"
            placeholder="Ej: F001"
            control={form.control}
            uppercase
          />
          <FormInput
            name="document_number"
            label="Número"
            placeholder="Ej: 00123"
            control={form.control}
            uppercase
          />
          <DatePickerFormField
            name="issue_date"
            label="Fecha de Emisión"
            control={form.control}
          />
          <FormSelect
            name="currency_id"
            label="Moneda"
            placeholder="Selecciona una moneda"
            options={currencies.map((c) => ({
              label: `${c.name} (${c.symbol})`,
              value: c.id.toString(),
            }))}
            control={form.control}
          />
          <FormInput
            name="amount"
            label="Monto"
            type="number"
            step="0.01"
            control={form.control}
            required
          />
          <div className="md:col-span-2 flex flex-col gap-3">
            {mode === "update" && (existingFiles.length > 0 || legacyFileUrl) && (
              <div className="space-y-2">
                {existingFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Archivos guardados
                  </p>
                )}
                <div className="space-y-2">
                  {existingFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      {f.mimeType?.includes("pdf") ? (
                        <FileText className="h-8 w-8 shrink-0 text-primary" />
                      ) : (
                        <img
                          src={f.url}
                          alt="Sustento"
                          className="h-10 w-10 object-cover rounded shrink-0"
                        />
                      )}
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline underline-offset-2 flex-1 truncate"
                      >
                        Ver archivo
                      </a>
                      {onDeleteExistingFile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteExistingFile(f.id)}
                          disabled={isSubmitting || deletingFileId === f.id}
                        >
                          {deletingFileId === f.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                  {existingFiles.length === 0 && legacyFileUrl && (
                    <a
                      href={legacyFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline underline-offset-2 w-fit block"
                    >
                      Ver archivo actual
                    </a>
                  )}
                </div>
              </div>
            )}
            <MultipleFileUploadWithCamera
              label={
                mode === "update" ? "Agregar más archivos" : "Archivos del Sustento"
              }
              value={files}
              onChange={setFiles}
              disabled={isSubmitting}
              maxFiles={maxNewFiles}
            />
          </div>
          <FormInput
            name="notes"
            label="Notas"
            control={form.control}
            className="md:col-span-2"
            uppercase
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={SUPPORTS.ABSOLUTE_ROUTE!}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Sustento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
