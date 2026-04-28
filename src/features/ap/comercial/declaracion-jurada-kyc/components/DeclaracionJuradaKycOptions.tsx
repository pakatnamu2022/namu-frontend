"use client";

import { FormSelect } from "@/shared/components/FormSelect";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { KYC_STATUS_OPTIONS } from "../lib/declaracionJuradaKyc.constants";
import SearchInput from "@/shared/components/SearchInput";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export default function DeclaracionJuradaKycOptions({
  search,
  setSearch,
  status,
  setStatus,
}: Props) {
  const form = useForm({
    defaultValues: { status },
  });

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por cliente o documento..."
      />
      <Form {...form}>
        <FormSelect
          name="status"
          label=""
          placeholder="Todos los estados"
          options={[{ label: "Todos", value: "" }, ...KYC_STATUS_OPTIONS]}
          control={form.control}
          className="sm:max-w-[180px]"
          onValueChange={setStatus}
        />
      </Form>
    </div>
  );
}
