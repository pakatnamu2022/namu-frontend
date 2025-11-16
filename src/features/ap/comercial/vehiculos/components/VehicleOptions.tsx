"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VehicleOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function VehicleOptions({
  search,
  setSearch,
}: VehicleOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Buscar por VIN, modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
