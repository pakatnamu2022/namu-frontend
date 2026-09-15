"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader, PenTool, ShieldCheck } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  SignerSchema,
  signerSchemaCreate,
  signerSchemaUpdate,
} from "../lib/signer.schema.ts";
import { SIGNER } from "../lib/signer.constant.ts";
import { Option } from "@/core/core.interface.ts";

interface SignerFormProps {
  defaultValues: Partial<SignerSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultOptions?: {
    persona?: Option;
  };
  currentFiles?: {
    hasCertificate?: boolean;
    hasKey?: boolean;
    hasFirmaimg?: boolean;
  };
}

export const SignerForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultOptions,
  currentFiles,
}: SignerFormProps) => {
  const { ABSOLUTE_ROUTE } = SIGNER;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create" ? signerSchemaCreate : signerSchemaUpdate,
    ) as any,
    defaultValues: {
      nombre: "",
      file: null,
      key: null,
      firmaimg: null,
      password: "",
      fecha_vencimiento: "",
      persona_id: "",
      sucursal_id: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: sedesData } = useAllSedes();
  const sedeOptions = (sedesData ?? []).map((s) => ({
    value: String(s.id),
    label: s.description,
    description: s.suc_abrev,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Datos del Firmante"
          icon={PenTool}
          color="blue"
          cols={{ sm: 2 }}
        >
          <FormInput
            control={form.control}
            name="nombre"
            label="Nombre"
            required
            placeholder="Ej: Juan Pérez - Grupo Pakatnamu"
          />
          <FormSelect
            control={form.control}
            name="sucursal_id"
            label="Sede / Empresa"
            placeholder="Seleccionar sede..."
            options={sedeOptions}
          />
          <FormSelectAsync
            control={form.control}
            name="persona_id"
            label="Trabajador asociado"
            placeholder="Seleccionar trabajador..."
            useQueryHook={useWorkers}
            mapOptionFn={(worker) => ({
              value: String(worker.id),
              label: worker.name,
              description: worker.document,
            })}
            defaultOption={defaultOptions?.persona}
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_vencimiento"
            label="Vencimiento del certificado"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Certificado X.509"
          icon={ShieldCheck}
          color="violet"
          cols={{ sm: 2 }}
        >
          <div className="flex flex-col gap-2">
            <FormLabel>
              Certificado (.cer)
              {currentFiles?.hasCertificate && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (ya configurado, sube uno nuevo para reemplazarlo)
                </span>
              )}
            </FormLabel>
            <FileUploadWithCamera
              label="Certificado"
              accept=".cer,.crt,.pem"
              value={form.watch("file")}
              showPreview={false}
              onChange={(file) =>
                form.setValue("file", file, { shouldValidate: true, shouldDirty: true })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <FormLabel>
              Llave privada (.key)
              {currentFiles?.hasKey && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (ya configurada, sube una nueva para reemplazarla)
                </span>
              )}
            </FormLabel>
            <FileUploadWithCamera
              label="Llave privada"
              accept=".key,.pem"
              value={form.watch("key")}
              showPreview={false}
              onChange={(file) =>
                form.setValue("key", file, { shouldValidate: true, shouldDirty: true })
              }
            />
          </div>
          <FormInput
            control={form.control}
            name="password"
            label="Contraseña de la llave privada"
            type="password"
            placeholder="Dejar en blanco si no tiene contraseña"
          />
          <div className="flex flex-col gap-2">
            <FormLabel>
              Imagen de la firma
              {currentFiles?.hasFirmaimg && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (ya configurada)
                </span>
              )}
            </FormLabel>
            <FileUploadWithCamera
              label="Imagen de firma"
              accept="image/*"
              value={form.watch("firmaimg")}
              onChange={(file) =>
                form.setValue("firmaimg", file, { shouldValidate: true, shouldDirty: true })
              }
            />
          </div>
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Firmante"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
