"use client";
import SearchInput from "@/shared/components/SearchInput";


export default function GoalTravelOptions({
    search,
    setSearch
}: {
    search: string;
    setSearch: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    useStatus: string;
    setUseStatus: (value: string) => void;
}){
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar..."
            />

        </div>
    )
}