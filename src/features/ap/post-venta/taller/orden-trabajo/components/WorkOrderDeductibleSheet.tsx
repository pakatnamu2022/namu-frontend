import { useState } from "react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import SearchInput from "@/shared/components/SearchInput";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { formatMoney } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useElectronicDocuments } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { SUNAT_CURRENCY_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { cn } from "@/lib/utils";

interface WorkOrderDeductibleSheetProps {
  open: boolean;
  onClose: () => void;
  sedeId?: string | number;
  currencyId?: string | number;
  onSelectDocument: (document: ElectronicDocumentResource) => void;
  isSubmitting?: boolean;
}

// Traduce el id de moneda de la OT (CURRENCY_TYPE_IDS) al id SUNAT usado por los comprobantes (SUNAT_CURRENCY_ID)
const toSunatCurrencyId = (currencyId?: string | number) => {
  switch (String(currencyId)) {
    case CURRENCY_TYPE_IDS.SOLES:
      return SUNAT_CURRENCY_ID.SOLES;
    case CURRENCY_TYPE_IDS.DOLLARS:
      return SUNAT_CURRENCY_ID.DOLARES;
    default:
      return undefined;
  }
};

export const WorkOrderDeductibleSheet = ({
  open,
  onClose,
  sedeId,
  currencyId,
  onSelectDocument,
  isSubmitting,
}: WorkOrderDeductibleSheetProps) => {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useElectronicDocuments(
    {
      page,
      per_page,
      search,
      seriesModel$sede_id: sedeId ? Number(sedeId) : undefined,
      sunat_concept_currency_id: toSunatCurrencyId(currencyId),
      status: "accepted",
    },
    open,
  );

  const documents = data?.data || [];

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Seleccionar Comprobante"
      subtitle="Elige el comprobante que se asociará como deducible"
      icon="Receipt"
      size="lg"
    >
      <div className="flex flex-col gap-3">
        <SearchInput
          label="Buscar Comprobante"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Serie, número o cliente..."
        />

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Cargando comprobantes...
            </p>
          ) : documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron comprobantes para esta sede.
            </p>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => onSelectDocument(doc)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-muted/40 disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {doc.full_number}
                    </span>
                    <span className="rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {doc.document_type?.description || "N/A"}
                    </span>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {doc.cliente_denominacion}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-green-700">
                  {formatMoney(doc.total, 2, doc.currency?.symbol || "S/")}
                </span>
              </button>
            ))
          )}
        </div>

        <DataTablePagination
          page={page}
          totalPages={data?.meta?.last_page || 1}
          totalData={data?.meta?.total || 0}
          onPageChange={setPage}
          per_page={per_page}
          setPerPage={setPerPage}
        />
      </div>
    </GeneralSheet>
  );
};
