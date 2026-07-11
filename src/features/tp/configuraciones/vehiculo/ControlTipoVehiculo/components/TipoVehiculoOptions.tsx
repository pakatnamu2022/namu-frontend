"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
];

export default function TipoVehiculoOptions({
    search,
    setSearch,
    status,
    setStatus,
}: {
    search: string;
    setSearch: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar tipo de vehículo..."
            />
            <SearchableSelect
                onChange={setStatus}
                value={status}
                options={STATUS_OPTIONS}
                placeholder="Estado"
            />
        </div>
    );
}