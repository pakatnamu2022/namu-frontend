import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

export default function PerDiemRequestOptions({
  search,
  setSearch,
  approvalStatus,
  setApprovalStatus,
}: {
  search: string;
  setSearch: (value: string) => void;
  approvalStatus?: "pending" | "approved" | "all";
  setApprovalStatus?: (value: "pending" | "approved" | "all") => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar solicitud de viático..."
      />
      {approvalStatus !== undefined && setApprovalStatus && (
        <SearchableSelect
          value={approvalStatus}
          onChange={(value) =>
            setApprovalStatus(value as "pending" | "approved" | "all")
          }
          options={[
            { label: "Pendientes", value: "pending" },
            { label: "Aprobadas", value: "approved" },
            { label: "Todas", value: "all" },
          ]}
          placeholder="Estado de aprobación"
          showSearch={false}
          className="w-[180px]"
        />
      )}
    </div>
  );
}
