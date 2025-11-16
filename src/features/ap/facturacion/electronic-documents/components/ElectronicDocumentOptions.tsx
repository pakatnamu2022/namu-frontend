import SearchInput from "@/shared/components/SearchInput";
import {
  DOCUMENT_STATUS,
  ORIGIN_MODULES,
} from "../lib/electronicDocument.constants";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  moduleFilter: string;
  setModuleFilter: (value: string) => void;
  documentTypeFilter: string;
  setDocumentTypeFilter: (value: string) => void;
  documentTypes: SunatConceptsResource[];
}

export default function ElectronicDocumentOptions({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  moduleFilter,
  setModuleFilter,
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

      {setModuleFilter && (
        <SearchableSelect
          onChange={setModuleFilter}
          value={moduleFilter}
          className="md:min-w-44"
          placeholder="Seleccionar Módulo"
          options={ORIGIN_MODULES.map((module) => ({
            value: module.value,
            label: module.label,
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
