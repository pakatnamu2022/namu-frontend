import {
  DepartmentResource,
  ProvinceResource,
} from "@/src/features/gp/gestionsistema/ubicaciones/lib/location.interface";
import SearchInput from "@/src/shared/components/SearchInput";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  departments: DepartmentResource[];
  departmentId: string;
  setDepartmentId: (value: string) => void;
  provinces: ProvinceResource[];
  provinceId: string;
  setProvinceId: (value: string) => void;
}

export default function DistrictOptions({
  search,
  setSearch,
  departments = [],
  departmentId,
  setDepartmentId,
  provinces = [],
  provinceId,
  setProvinceId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchableSelect
        options={departments.map((department) => ({
          value: department.id.toString(),
          label: department.name,
        }))}
        value={departmentId}
        onChange={setDepartmentId}
        placeholder="Filtrar por departamento"
        className="min-w-72"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={provinces.map((province) => ({
          value: province.id.toString(),
          label: province.name,
        }))}
        value={provinceId}
        onChange={setProvinceId}
        placeholder="Filtrar por provincia"
        className="min-w-72"
        classNameOption="text-xs"
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ubigeo / distrito..."
      />
    </div>
  );
}
