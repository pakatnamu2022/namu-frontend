import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { Settings } from "lucide-react";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  PAYMENT_CONDITIONS,
  PAYMENT_CONDITION_CREDIT,
  CREDIT_DAYS_OPTIONS,
} from "../../lib/electronicDocument.constants";
import { CHECKBOOKS_ID } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

interface AdditionalConfigSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  checkbooks: ApBankResource[];
  isModuleCommercial?: boolean;
  useQuotation?: boolean;
  showCardLast4?: boolean;
  showInternalNote?: boolean;
  showOrdenCompraServicio?: boolean;
  isEdit?: boolean;
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
}: AdditionalConfigSectionProps) {
  const medioDePago = form.watch("medio_de_pago");
  const condicionesDePago = form.watch("condiciones_de_pago");
  const isCredito = medioDePago === PAYMENT_CONDITION_CREDIT;
  const ordenCompraServicio = form.watch("orden_compra_servicio");

  // Limpiar al cambiar a CONTADO; poner 30 días por defecto al cambiar a CREDITO
  useEffect(() => {
    if (!isCredito) {
      form.setValue("credit_days", undefined);
      form.setValue("venta_al_credito", []);
      form.setValue("fecha_de_vencimiento", undefined);
    } else {
      form.setValue("credit_days", "30");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCredito]);

  // Recalcular fecha de vencimiento cuando cambian los días de crédito
  const creditDaysValue = form.watch("credit_days");
  useEffect(() => {
    if (creditDaysValue) {
      handleCreditDaysChange(creditDaysValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditDaysValue]);

  function handleCreditDaysChange(days: string) {
    const fechaEmision = form.getValues("fecha_de_emision");
    const total = form.getValues("total");
    if (!fechaEmision) return;

    const [yyyyE, mmE, ddE] = String(fechaEmision).split("-").map(Number);
    const fechaPago = new Date(yyyyE, mmE - 1, ddE + Number(days));
    const dd = String(fechaPago.getDate()).padStart(2, "0");
    const mm = String(fechaPago.getMonth() + 1).padStart(2, "0");
    const yyyy = fechaPago.getFullYear();
    const fechaFormateada = `${dd}-${mm}-${yyyy}`;

    // Setear la fecha de vencimiento calculada en el form principal
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
            Object.values(CHECKBOOKS_ID).includes(checkbook.id),
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

  return (
    <GroupFormSection
      title="Configuración Adicional"
      icon={Settings}
      color="primary"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        label="Condiciones de Pago *"
        name="medio_de_pago"
        options={PAYMENT_CONDITIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
      />
      {isCredito ? (
        <>
          {/* <FormCombobox
            control={form.control}
            label="Días de Crédito *"
            name="credit_days"
            options={CREDIT_DAYS_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            placeholder="Seleccione los días"
            description="La fecha de vencimiento se calculará automáticamente."
            validateCreate={(val) => /^\d+$/.test(val)}
          /> */}

          <FormSelect
            control={form.control}
            label="Días de Crédito *"
            name="credit_days"
            options={CREDIT_DAYS_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            placeholder="Seleccione los días"
            description="La fecha de vencimiento se calculará automáticamente."
          />

          {useQuotation && (
            <FormSelect
              control={form.control}
              label="Tipo de Financiamiento *"
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
            label="Entidad"
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
      {showCardLast4 && (
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
          label="Nota interna"
          placeholder="Nota interna..."
          description="Nota interna (no se muestra en el documento)."
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
          {!!ordenCompraServicio && !isEdit && (
            <div className="col-span-full">
              <FileUploadWithCamera
                label="Archivo de orden de compra/servicio (opcional)"
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
