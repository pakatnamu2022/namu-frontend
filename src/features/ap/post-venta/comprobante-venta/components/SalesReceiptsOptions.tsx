import SearchInput from "@/shared/components/SearchInput";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { DOCUMENT_STATUS } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  documentTypeFilter: string;
  setDocumentTypeFilter: (value: string) => void;
  documentTypes: SunatConceptsResource[];
}

export default function SalesReceiptsOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  statusFilter,
  setStatusFilter,
  documentTypeFilter,
  setDocumentTypeFilter,
  documentTypes = [],
}: Props) {
  return (
    <div className="flex items-end gap-4 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por cliente, serie, número..."
      />
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        className="min-w-56"
        classNameOption="text-xs"
      />

      {setStatusFilter && (
        <SearchableSelect
          onChange={setStatusFilter}
          value={statusFilter}
          className="md:min-w-44"
          placeholder="Seleccionar Estado"
          options={DOCUMENT_STATUS.map((status) => ({
            value: status.value,
            label: status.label,
          }))}
        />
      )}

      {setDocumentTypeFilter && documentTypes.length > 0 && (
        <SearchableSelect
          onChange={setDocumentTypeFilter}
          value={documentTypeFilter}
          className="md:min-w-64"
          placeholder="Seleccionar Tipo de Documento"
          options={documentTypes.map((type) => ({
            value: type.id.toString(),
            label: type.description,
          }))}
        />
      )}
    </div>
  );
}
