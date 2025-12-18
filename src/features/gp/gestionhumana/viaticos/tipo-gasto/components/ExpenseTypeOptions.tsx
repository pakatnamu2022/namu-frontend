"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ExpenseTypeOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function ExpenseTypeOptions({
  search,
  setSearch,
}: ExpenseTypeOptionsProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Buscar tipo de gasto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
