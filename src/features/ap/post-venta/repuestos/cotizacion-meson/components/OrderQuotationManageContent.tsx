import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Plus,
  Truck,
  LinkIcon,
  Unlink,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  updateOrderQuotationInvoiceTo,
  associateShippingGuide,
  dissociateShippingGuide,
  storeOrderQuotationDeductible,
  deleteOrderQuotationDeductible,
} from "../lib/quotationMeson.actions";
import { getShippingGuides } from "@/features/ap/shipping_guides/lib/shippingGuides.actions";
import { SHIPPING_GUIDES } from "@/features/ap/shipping_guides/lib/shippingGuides.constants";
import type { ShippingGuidesResource } from "@/features/ap/shipping_guides/lib/shippingGuides.interface";
import { errorToast, formatDate, formatMoney, successToast } from "@/core/core.function";
import { useState, useMemo, useEffect } from "react";
import { InfoSection } from "@/shared/components/InfoSection";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { CUSTOMERS } from "@/features/ap/comercial/clientes/lib/customers.constants";
import CustomerModal from "@/features/ap/comercial/clientes/components/CustomerModal";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import SearchInput from "@/shared/components/SearchInput";
import FilterWrapper from "@/shared/components/FilterWrapper";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useQuery } from "@tanstack/react-query";
import { STATUS_ORDER_QUOTE } from "../../../taller/cotizacion/lib/proforma.constants";
import { OrderQuotationDeductibleSheet } from "./OrderQuotationDeductibleSheet";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

const DEFAULT_PER_PAGE = 10;

function buildShippingGuidesColumns(
  associatingId: number | null,
  onAssociate: (id: number) => void,
): ColumnDef<ShippingGuidesResource>[] {
  return [
    {
      accessorKey: "document_number",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.document_number}</div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Fecha Emisión",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.original.issue_date)}</div>
      ),
    },
    {
      accessorKey: "receiver_name",
      header: "Destinatario",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.receiver_name || "-"}</div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const id = row.original.id;
        const isThis = associatingId === id;
        const isBusy = associatingId !== null;
        return (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={isBusy}
              onClick={() => onAssociate(id)}
            >
              {isThis ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];
}

function ShippingGuideSelectorOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número..."
      />
    </FilterWrapper>
  );
}

function ShippingGuideSelectorTable({
  data,
  isLoading,
  associatingId,
  onAssociate,
  children,
}: {
  data: ShippingGuidesResource[];
  isLoading: boolean;
  associatingId: number | null;
  onAssociate: (id: number) => void;
  children?: React.ReactNode;
}) {
  const columns = buildShippingGuidesColumns(associatingId, onAssociate);
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}

interface OrderQuotationManageContentProps {
  orderQuotation: OrderQuotationResource;
  onRefresh?: () => void;
}

export function OrderQuotationManageContent({
  orderQuotation,
  onRefresh,
}: OrderQuotationManageContentProps) {
  const queryClient = useQueryClient();
  const activeVouchers = orderQuotation.vouchers?.active ?? [];
  const hasAdvances = activeVouchers.length > 0;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isShippingGuideSheetOpen, setIsShippingGuideSheetOpen] =
    useState(false);
  const [sgSearch, setSgSearch] = useState("");
  const [sgPage, setSgPage] = useState(1);
  const [associatingId, setAssociatingId] = useState<number | null>(null);
  const [showDeductibleSheet, setShowDeductibleSheet] = useState(false);
  const [showRemoveDeductibleConfirm, setShowRemoveDeductibleConfirm] =
    useState(false);

  const isInvoiced = orderQuotation.status.id === STATUS_ORDER_QUOTE.FACTURADO;
  const { deductible, deductible_amount } = orderQuotation;
  const hasDeductible = deductible_amount > 0 && !!deductible;
  const currencySymbol = orderQuotation.type_currency?.symbol || "S/";

  const shippingGuideParams = {
    sede_transmitter_id: orderQuotation.sede_id,
    is_associated: false,
    transfer_reason_id: [SUNAT_CONCEPTS_ID.TRANSFER_REASON_OTROS],
    search: sgSearch || undefined,
    page: sgPage,
    per_page: DEFAULT_PER_PAGE,
  };
  const { data: shippingGuidesData, isLoading: isLoadingShippingGuides } =
    useQuery({
      queryKey: [SHIPPING_GUIDES.QUERY_KEY, shippingGuideParams],
      queryFn: () => getShippingGuides({ params: shippingGuideParams }),
      enabled: isShippingGuideSheetOpen,
      refetchOnWindowFocus: false,
    });

  const handleAssociate = (shippingGuideId: number) => {
    setAssociatingId(shippingGuideId);
    associateShippingGuide(orderQuotation.id, shippingGuideId)
      .then(() => {
        successToast("Guía de remisión asociada correctamente");
        setIsShippingGuideSheetOpen(false);
        setSgSearch("");
        setSgPage(1);
        queryClient.invalidateQueries({
          queryKey: ["orderQuotation", orderQuotation.id],
        });
        onRefresh?.();
      })
      .catch((error: any) => {
        errorToast(
          error?.response?.data?.message ||
            "Error al asociar la guía de remisión",
        );
      })
      .finally(() => setAssociatingId(null));
  };

  const dissociateMutation = useMutation({
    mutationFn: () => dissociateShippingGuide(orderQuotation.id),
    onSuccess: () => {
      successToast("Guía de remisión desasociada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al desasociar la guía de remisión",
      );
    },
  });

  // Formulario para "Facturar a"
  const invoiceToForm = useForm<{ invoice_to_id: string }>({
    defaultValues: { invoice_to_id: "" },
  });

  const invoiceToDefaultOption = useMemo(() => {
    if (orderQuotation.invoice_to) {
      return {
        value: orderQuotation.invoice_to.toString(),
        label: `${orderQuotation.invoice_to_client?.full_name} - ${orderQuotation.invoice_to_client?.num_doc || "S/N"}`,
      };
    }
    return undefined;
  }, [orderQuotation.invoice_to, orderQuotation.invoice_to_client]);

  useEffect(() => {
    if (invoiceToDefaultOption) {
      invoiceToForm.setValue("invoice_to_id", invoiceToDefaultOption.value);
    }
  }, [invoiceToDefaultOption, invoiceToForm]);

  const invoiceToMutation = useMutation({
    mutationFn: (customerId: number | null) =>
      updateOrderQuotationInvoiceTo(orderQuotation.id, customerId),
    onSuccess: () => {
      successToast("Cliente de facturación actualizado");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      queryClient.invalidateQueries({ queryKey: ["useOrderQuotations"] });
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al actualizar el cliente de facturación",
      );
    },
  });

  const storeDeductibleMutation = useMutation({
    mutationFn: (document: ElectronicDocumentResource) =>
      storeOrderQuotationDeductible({
        order_quotation_id: orderQuotation.id,
        electronic_document_id: document.id,
      }),
    onSuccess: () => {
      successToast("Deducible asociado exitosamente a la cotización");
      setShowDeductibleSheet(false);
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      queryClient.invalidateQueries({ queryKey: ["useOrderQuotations"] });
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al asociar el deducible",
      );
    },
  });

  const removeDeductibleMutation = useMutation({
    mutationFn: () => deleteOrderQuotationDeductible(deductible!.id),
    onSuccess: () => {
      successToast("Deducible eliminado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      queryClient.invalidateQueries({ queryKey: ["useOrderQuotations"] });
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al eliminar el deducible",
      );
    },
  });

  return (
    <div className="space-y-6 px-6">
      {/* Facturar a */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Facturar a
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isInvoiced
                ? "Cliente de facturación establecido"
                : "Selecciona el cliente para la factura"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <FormProvider {...invoiceToForm}>
              <div className="flex w-full items-center gap-2">
                <div className="flex-1 min-w-0">
                  <FormSelectAsync
                    name="invoice_to_id"
                    label="Cliente de facturación"
                    placeholder="Seleccionar cliente"
                    control={invoiceToForm.control}
                    useQueryHook={useCustomers}
                    mapOptionFn={(customer: CustomersResource) => ({
                      value: customer.id.toString(),
                      label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
                    })}
                    description={
                      isInvoiced
                        ? "Ya existe una factura emitida, no se puede modificar"
                        : hasAdvances
                          ? "Ya se registraron avances de pago, no se puede modificar"
                          : "Cliente a quien se le emitirá la factura de esta cotización"
                    }
                    perPage={10}
                    debounceMs={500}
                    disabled={
                      isInvoiced || invoiceToMutation.isPending || hasAdvances
                    }
                    defaultOption={invoiceToDefaultOption}
                    onValueChange={(value) => {
                      invoiceToMutation.mutate(value ? Number(value) : null);
                    }}
                    allowClear={false}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="aspect-square shrink-0"
                  onClick={() => setIsCustomerModalOpen(true)}
                  tooltip="Agregar nuevo cliente"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FormProvider>
          </div>

          {orderQuotation.invoice_to && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 h-fit">
              <div className="flex-1 grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Nombre
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {orderQuotation.invoice_to_client?.full_name || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Documento
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {orderQuotation.invoice_to_client?.document_type || "—"}{" "}
                    {orderQuotation.invoice_to_client?.num_doc || "S/N"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CustomerModal
        open={isCustomerModalOpen}
        onClose={(newCustomer) => {
          setIsCustomerModalOpen(false);
          if (newCustomer) {
            queryClient.invalidateQueries({
              queryKey: [CUSTOMERS.QUERY_KEY],
            });
          }
        }}
        title="Agregar Nuevo Cliente"
      />

      <Separator />

      {/* Deducible */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Deducible</h3>
          </div>
          {!hasDeductible && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={storeDeductibleMutation.isPending}
              onClick={() => setShowDeductibleSheet(true)}
            >
              {storeDeductibleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-1" />
              )}
              Asociar Deducible
            </Button>
          )}
          {hasDeductible && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
              disabled={removeDeductibleMutation.isPending}
              onClick={() => setShowRemoveDeductibleConfirm(true)}
            >
              {removeDeductibleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-1" />
              )}
              Quitar Deducible
            </Button>
          )}
        </div>

        {hasDeductible ? (
          <div className="space-y-3">
            <InfoSection
              title=""
              fields={[
                {
                  label: "Comprobante",
                  value: deductible!.full_number,
                },
                {
                  label: "Monto Deducible",
                  value: formatMoney(deductible_amount, 2, currencySymbol),
                },
                {
                  label: "Cliente",
                  value: deductible!.cliente_denominacion,
                },
                {
                  label: "Documento",
                  value: deductible!.cliente_numero_de_documento,
                },
              ]}
            />

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal Cotización</span>
                <span className="font-medium">
                  {formatMoney(orderQuotation.subtotal, 2, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IGV</span>
                <span className="font-medium">
                  {formatMoney(orderQuotation.tax_amount ?? 0, 2, currencySymbol)}
                </span>
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-primary">
                  Total Cotización
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatMoney(orderQuotation.total_amount, 2, currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
            <ShieldOff className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No hay deducible asociado
            </p>
          </div>
        )}
      </div>

      <OrderQuotationDeductibleSheet
        open={showDeductibleSheet}
        onClose={() => setShowDeductibleSheet(false)}
        sedeId={orderQuotation.sede_id}
        currencyId={orderQuotation.currency_id}
        plate={orderQuotation.vehicle?.plate}
        onSelectDocument={(document) => storeDeductibleMutation.mutate(document)}
        isSubmitting={storeDeductibleMutation.isPending}
      />

      <ConfirmationDialog
        open={showRemoveDeductibleConfirm}
        onOpenChange={setShowRemoveDeductibleConfirm}
        trigger={<span className="hidden" />}
        title="¿Quitar deducible?"
        description="Esta acción eliminará el deducible asociado a la cotización. ¿Estás seguro de que deseas continuar?"
        confirmText="Sí, quitar"
        cancelText="Cancelar"
        icon="warning"
        onConfirm={() => removeDeductibleMutation.mutate()}
      />

      <Separator />

      {/* Guía de Remisión (opcional) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Guía de Remisión</h3>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Opcional
            </Badge>
          </div>
          {!orderQuotation.shipping_guide && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsShippingGuideSheetOpen(true)}
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Adjuntar
            </Button>
          )}
          {orderQuotation.shipping_guide && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
              disabled={dissociateMutation.isPending}
              onClick={() => dissociateMutation.mutate()}
            >
              {dissociateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-1" />
              )}
              Desasociar
            </Button>
          )}
        </div>

        {orderQuotation.shipping_guide ? (
          <InfoSection
            title=""
            fields={[
              {
                label: "Número",
                value: orderQuotation.shipping_guide.document_number,
              },
              {
                label: "Fecha Emisión",
                value: formatDate(orderQuotation.shipping_guide.issue_date),
              },
              ...(orderQuotation.shipping_guide.receiver_name
                ? [
                    {
                      label: "Destinatario",
                      value: orderQuotation.shipping_guide.receiver_name,
                    },
                  ]
                : []),
              ...(orderQuotation.shipping_guide.transfer_reason_description
                ? [
                    {
                      label: "Motivo Traslado",
                      value:
                        orderQuotation.shipping_guide
                          .transfer_reason_description,
                    },
                  ]
                : []),
            ]}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
            <Truck className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No hay guía de remisión adjunta
            </p>
          </div>
        )}
      </div>

      {/* Sheet para seleccionar guía de remisión */}
      <GeneralSheet
        open={isShippingGuideSheetOpen}
        onClose={() => {
          setIsShippingGuideSheetOpen(false);
          setSgSearch("");
          setSgPage(1);
        }}
        title="Adjuntar Guía de Remisión"
        subtitle="Selecciona una guía de remisión para asociar a esta cotización"
        icon="Truck"
        size="3xl"
      >
        <div className="px-2 space-y-4">
          {!shippingGuidesData?.data?.length && !isLoadingShippingGuides ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">
                No hay guías de remisión disponibles para asociar
              </p>
            </div>
          ) : (
            <>
              <ShippingGuideSelectorTable
                data={shippingGuidesData?.data ?? []}
                isLoading={isLoadingShippingGuides}
                associatingId={associatingId}
                onAssociate={handleAssociate}
              >
                <ShippingGuideSelectorOptions
                  search={sgSearch}
                  setSearch={(v) => {
                    setSgSearch(v);
                    setSgPage(1);
                  }}
                />
              </ShippingGuideSelectorTable>
              {shippingGuidesData?.meta && (
                <DataTablePagination
                  page={sgPage}
                  per_page={DEFAULT_PER_PAGE}
                  totalPages={shippingGuidesData.meta.last_page}
                  totalData={shippingGuidesData.meta.total}
                  onPageChange={setSgPage}
                />
              )}
            </>
          )}
        </div>
      </GeneralSheet>
    </div>
  );
}
