import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { ExternalLink, FileText, Settings } from "lucide-react";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  PAYMENT_CONDITIONS,
  PAYMENT_CONDITION_CREDIT,
  CREDIT_DAYS_OPTIONS,
} from "../../lib/electronicDocument.constants";

interface AdditionalConfigSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  checkbooks: ApBankResource[];
  isModuleCommercial?: boolean;
  useQuotation?: boolean;
  showCardLast4?: boolean;
  showInternalNote?: boolean;
  showOrdenCompraServicio?: boolean;
  isEdit?: boolean;
  existingFileUrl?: string;
  isAdvancePayment?: boolean;
  defaultMessage?: string;
}

export function AdditionalConfigSection({
  form,
  checkbooks,
  isModuleCommercial = true,
  useQuotation = false,
  showCardLast4 = false,
  showInternalNote = false,
  showOrdenCompraServicio = false,
  isEdit = false,
  existingFileUrl = "",
  isAdvancePayment = false,
  defaultMessage = "",
}: AdditionalConfigSectionProps) {
  const medioDePago = form.watch("medio_de_pago");
  const condicionesDePago = form.watch("condiciones_de_pago");
  const isCredito = medioDePago === PAYMENT_CONDITION_CREDIT;
  const ordenCompraServicio = form.watch("orden_compra_servicio");

  // Limpiar al cambiar a CONTADO; poner 30 días por defecto al cambiar a CREDITO.
  // En modo edición, esperamos a que medio_de_pago tenga un valor real antes de limpiar.
  const medioDePagoInitialized =
    medioDePago !== "" && medioDePago !== undefined;
  useEffect(() => {
    if (isEdit && !medioDePagoInitialized) return;
    if (!isCredito) {
      form.setValue("credit_days", undefined);
      form.setValue("venta_al_credito", []);
      const fechaEmision = form.getValues("fecha_de_emision");
      form.setValue(
        "fecha_de_vencimiento",
        fechaEmision ? String(fechaEmision).split("T")[0] : undefined,
      );
    } else if (!form.getValues("credit_days")) {
      form.setValue("credit_days", "30");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCredito]);

  // Recalcular fecha de vencimiento cuando cambian los días de crédito
  const creditDaysValue = form.watch("credit_days");

  function calcFechaVencimiento(days: string): string | null {
    const numDays = Number(days);
    if (!days || isNaN(numDays) || numDays < 1 || numDays > 50) return null;
    const fechaEmision = form.getValues("fecha_de_emision");
    if (!fechaEmision) return null;
    const datePart = String(fechaEmision).split("T")[0];
    const [yyyyE, mmE, ddE] = datePart.split("-").map(Number);
    if (isNaN(yyyyE) || isNaN(mmE) || isNaN(ddE)) return null;
    const fechaPago = new Date(yyyyE, mmE - 1, ddE + numDays);
    const dd = String(fechaPago.getDate()).padStart(2, "0");
    const mm = String(fechaPago.getMonth() + 1).padStart(2, "0");
    const yyyy = fechaPago.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const fechaVencimientoPreview = creditDaysValue
    ? calcFechaVencimiento(creditDaysValue)
    : null;
  useEffect(() => {
    if (creditDaysValue) {
      handleCreditDaysChange(creditDaysValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditDaysValue]);

  function handleCreditDaysChange(days: string) {
    const numDays = Number(days);
    if (!days || isNaN(numDays) || numDays < 1 || numDays > 50) return;

    const fechaEmision = form.getValues("fecha_de_emision");
    const total = form.getValues("total");
    if (!fechaEmision) return;

    // Parsear solo la parte de fecha (ignorar la parte de tiempo si existe)
    const datePart = String(fechaEmision).split("T")[0];
    const [yyyyE, mmE, ddE] = datePart.split("-").map(Number);
    if (isNaN(yyyyE) || isNaN(mmE) || isNaN(ddE)) return;

    const fechaPago = new Date(yyyyE, mmE - 1, ddE + numDays);
    const dd = String(fechaPago.getDate()).padStart(2, "0");
    const mm = String(fechaPago.getMonth() + 1).padStart(2, "0");
    const yyyy = fechaPago.getFullYear();
    const fechaFormateada = `${dd}-${mm}-${yyyy}`;

    form.setValue("fecha_de_vencimiento", `${yyyy}-${mm}-${dd}`);

    form.setValue("venta_al_credito", [
      { cuota: 1, fecha_de_pago: fechaFormateada, importe: total ?? 0 },
    ]);
  }

  // Filtrar chequeras según el medio de pago seleccionado
  const filteredCheckbooks =
    condicionesDePago === "EFECTIVO"
      ? checkbooks.filter((checkbook) =>
          checkbook.code.toUpperCase().includes("CAJ01"),
        )
      : condicionesDePago === "TARJETA"
        ? checkbooks.filter((checkbook) =>
            checkbook.code.toUpperCase().includes("QR"),
          )
        : checkbooks.filter(
            (checkbook) => !checkbook.code.toUpperCase().includes("CAJ"),
          );

  const paymentMethodOptions = [
    ...(!isModuleCommercial ? [{ label: "EFECTIVO", value: "EFECTIVO" }] : []),
    {
      label: "TARJETA",
      value: "TARJETA",
    },
    {
      label: "TRANSFERENCIA BANCARIA",
      value: "TRANSFERENCIA BANCARIA",
    },
    {
      label: "DEPÓSITO BANCARIO",
      value: "DEPOSITO BANCARIO",
    },
  ];

  const financingTypeOptions = [
    {
      label: "CREDITO POR CONVENIO",
      value: "CONVENIO",
    },
    {
      label: "CREDITO VEHICULAR",
      value: "VEHICULAR",
    },
    {
      label: "CONTADO",
      value: "CONTADO",
    },
  ];

  const filteredFinancingTypeOptions = financingTypeOptions.filter((option) => {
    return option.label.includes(
      form.watch("medio_de_pago")?.toUpperCase() || "",
    );
  });

  // Seteamos el mensaje por defecto en observaciones si no hay uno ya establecido
  form.setValue("observaciones", defaultMessage);

  return (
    <GroupFormSection
      title="Configuración Adicional"
      icon={Settings}
      color="primary"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        label="Condiciones de Pago"
        name="medio_de_pago"
        options={PAYMENT_CONDITIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
        disabled={isAdvancePayment} // Deshabilitar si es un anticipo
        required
      />
      {isCredito ? (
        <>
          <div className="flex flex-col gap-1">
            <FormCombobox
              control={form.control}
              label="Días de Crédito"
              name="credit_days"
              options={CREDIT_DAYS_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              placeholder="Seleccione o escriba los días"
              description="Ingrese entre 1 y 50 días."
              required
              allowCreate
              validateCreate={(val) => {
                const num = Number(val);
                return /^\d+$/.test(val) && num >= 1 && num <= 50;
              }}
              formatDisplay={(val) => `${val} día${val === "1" ? "" : "s"}`}
            />
            {fechaVencimientoPreview && (
              <p className="text-xs text-blue-600 font-medium">
                Vence el: {fechaVencimientoPreview}
              </p>
            )}
          </div>

          {useQuotation && (
            <FormSelect
              control={form.control}
              label="Tipo de Financiamiento"
              name="financing_type"
              options={filteredFinancingTypeOptions}
              placeholder="Seleccione una opción"
              description="Tipo de financiamiento del documento."
              required
            />
          )}
        </>
      ) : (
        <>
          <FormSelect
            control={form.control}
            label="Medio de Pago *"
            name="condiciones_de_pago"
            options={paymentMethodOptions}
            placeholder="Seleccione una opción"
            description="Medio de pago utilizado en el documento."
          />

          <FormSelect
            control={form.control}
            label="Chequera"
            name="bank_id"
            options={filteredCheckbooks.map((checkbook) => ({
              label: checkbook.code,
              value: String(checkbook.id),
              description: checkbook.account_number,
            }))}
            placeholder="Seleccione una opción"
            description="Chequera asociada al medio de pago."
          />

          {condicionesDePago !== "EFECTIVO" && (
            <FormInput
              control={form.control}
              name="operation_number"
              label="Número de Operación"
              placeholder="Número de Operación"
              description="Número de operación asociada al pago."
            />
          )}

          {useQuotation && (
            <FormSelect
              control={form.control}
              label="Tipo de Financiamiento"
              name="financing_type"
              options={filteredFinancingTypeOptions}
              placeholder="Seleccione una opción"
              description="Tipo de financiamiento del documento."
              required
            />
          )}
        </>
      )}
      {showCardLast4 && condicionesDePago === "TARJETA" && (
        <FormInput
          control={form.control}
          name="card_last4"
          label="Últimos 4 dígitos de tarjeta"
          placeholder="Ej: 1234"
          description="Últimos 4 dígitos de la tarjeta usada."
          maxLength={4}
        />
      )}
      {showInternalNote && (
        <FormInput
          control={form.control}
          name="internal_note"
          label="Comentario"
          placeholder="Comentario interno..."
          description="Comentario (no se muestra en el documento)."
          maxLength={255}
        />
      )}
      {showOrdenCompraServicio && (
        <>
          <FormInput
            control={form.control}
            name="orden_compra_servicio"
            label="Orden de compra/servicio"
            placeholder="Orden de compra o servicio..."
            description="Número de orden de compra o servicio relacionado (opcional)."
            maxLength={255}
          />
          {!!ordenCompraServicio && (
            <div className="col-span-full space-y-2">
              {existingFileUrl && !form.watch("orden_compra_servicio_file") && (
                <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="flex-1 truncate text-sm text-blue-800">
                    Archivo actual guardado
                  </span>
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver archivo
                  </a>
                </div>
              )}
              <FileUploadWithCamera
                label={
                  existingFileUrl
                    ? "Reemplazar archivo (opcional)"
                    : "Archivo de orden de compra/servicio (opcional)"
                }
                value={form.watch("orden_compra_servicio_file") ?? null}
                onChange={(file) =>
                  form.setValue("orden_compra_servicio_file", file)
                }
              />
            </div>
          )}
        </>
      )}

      <div className="col-span-full">
        <FormTextArea
          control={form.control}
          name="observaciones"
          label="Observaciones"
          placeholder="Observaciones adicionales..."
          description="Información adicional que se mostrará en el documento."
        />
      </div>
    </GroupFormSection>
  );
}
