import SearchInput from "@/shared/components/SearchInput";
import { DOCUMENT_STATUS } from "../lib/electronicDocument.constants";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { AREA_OPTIONS } from "@/core/core.constants";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  areaFilter?: string;
  setAreaFilter?: (value: string) => void;
  documentTypeFilter: string;
  setDocumentTypeFilter: (value: string) => void;
  documentTypes: SunatConceptsResource[];
}

export default function ElectronicDocumentOptions({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  areaFilter,
  setAreaFilter,
  documentTypeFilter,
  setDocumentTypeFilter,
  documentTypes = [],
}: Props) {
  return (
    <div className="flex items-end gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por cliente, serie, número..."
        />
      </div>

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

      {areaFilter && setAreaFilter && (
        <SearchableSelect
          onChange={setAreaFilter}
          value={areaFilter}
          className="md:min-w-44"
          placeholder="Seleccionar Área"
          options={AREA_OPTIONS.map((area) => ({
            value: area.value,
            label: area.label,
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
