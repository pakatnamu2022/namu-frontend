"use client";

import { CompanyResource } from "@/features/gp/gestionsistema/empresa/lib/company.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

export default function PhoneLineOptions({
  search,
  setSearch,
  companies,
  companyId,
  setCompanyId,
}: {
  search: string;
  setSearch: (value: string) => void;
  companies: CompanyResource[];
  companyId: string;
  setCompanyId: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar línea telefónica..."
      />
      <SearchableSelect
        onChange={setCompanyId}
        options={companies.map((company) => ({
          label: company.name,
          value: company.id.toString(),
        }))}
        value={companyId}
        placeholder="Todas las empresas"
      />
    </div>
  );
}
