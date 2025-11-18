import { TypesOperationResource } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { ClassArticleResource } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.interface";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  typesOperation: TypesOperationResource[];
  typeOperationId: string;
  setTypeOperationId: (value: string) => void;
  classArticles: ClassArticleResource[];
  articleClassId: string;
  setArticleClassId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  isReceived: string;
  setIsReceived: (value: string) => void;
}

export default function WarehouseOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  typesOperation = [],
  typeOperationId,
  setTypeOperationId,
  classArticles = [],
  articleClassId,
  setArticleClassId,
  isReceived,
  setIsReceived,
}: Props) {
  // Filtrar clases de artículo según la operación seleccionada
  const filteredClassArticles = typeOperationId
    ? classArticles.filter(
        (classArticle) =>
          classArticle.type_operation_id?.toString() === typeOperationId
      )
    : classArticles;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar almacén..."
      />
      <SearchableSelect
        options={sedes.map((sede) => ({
          value: sede.id.toString(),
          label: sede.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Seleccionar Sede"
        className="min-w-48"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={typesOperation.map((typeOperation) => ({
          value: typeOperation.id.toString(),
          label: typeOperation.description,
        }))}
        value={typeOperationId}
        onChange={(value) => {
          setTypeOperationId(value);
          // Limpiar la clase de artículo si ya no está en las opciones filtradas
          if (value && articleClassId) {
            const isValid = classArticles.some(
              (ca) =>
                ca.id.toString() === articleClassId &&
                ca.type_operation_id?.toString() === value
            );
            if (!isValid) {
              setArticleClassId("");
            }
          }
        }}
        placeholder="Seleccionar Operación"
        className="min-w-40"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={filteredClassArticles.map((classArticle) => ({
          value: classArticle.id.toString(),
          label: classArticle.description,
        }))}
        value={articleClassId}
        onChange={setArticleClassId}
        placeholder="Seleccionar Clase"
        className="min-w-52"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={[
          { value: "1", label: "ALMACEN" },
          { value: "0", label: "POR RECIBIR" },
        ]}
        value={isReceived}
        onChange={setIsReceived}
        placeholder="Seleccionar Recepción"
        className="min-w-44"
        classNameOption="text-xs"
      />
    </div>
  );
}
