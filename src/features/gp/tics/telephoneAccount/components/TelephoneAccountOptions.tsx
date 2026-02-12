"use client";

import { CompanyResource } from "@/features/gp/gestionsistema/empresa/lib/company.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

interface TelephoneAccountOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  companies: CompanyResource[];
  companyId: string;
  setCompanyId: (value: string) => void;
}

export default function TelephoneAccountOptions({
  search,
  setSearch,
  companies,
  companyId,
  setCompanyId,
}: TelephoneAccountOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número de cuenta u operador..."
      />
      <SearchableSelect
        onChange={setCompanyId}
        options={companies.map((company) => ({
          label: company.businessName || company.name,
          value: company.id.toString(),
        }))}
        value={companyId}
        placeholder="Todas las empresas"
      />
    </div>
  );
}
