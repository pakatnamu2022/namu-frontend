"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import { DataTable } from "@/shared/components/DataTable";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { currentInventoryColumns } from "./CurrentInventoryColumns";
import { CurrentInventory as CurrentInventoryType } from "../lib/daily-delivery.interface";

interface CurrentInventoryProps {
  currentInventory: CurrentInventoryType;
}

function uniqueOptions(values: (string | null | undefined)[]) {
  const unique = Array.from(new Set(values.filter((v): v is string => !!v)));
  return unique.sort().map((value) => ({ value, label: value }));
}

export default function CurrentInventory({
  currentInventory,
}: CurrentInventoryProps) {
  const summaryEntries = currentInventory.summary ?? [];
  const items = currentInventory.items ?? [];

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [marca, setMarca] = useState("");
  const [sede, setSede] = useState("");
  const [almacen, setAlmacen] = useState("");

  const estadoOptions = useMemo(
    () => uniqueOptions(items.map((i) => i.estado)),
    [items],
  );
  const marcaOptions = useMemo(
    () => uniqueOptions(items.map((i) => i.marca)),
    [items],
  );
  const sedeOptions = useMemo(
    () => uniqueOptions(items.map((i) => i.sede)),
    [items],
  );
  const almacenOptions = useMemo(
    () => uniqueOptions(items.map((i) => i.almacen)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return items.filter((item) => {
      if (estado && item.estado !== estado) return false;
      if (marca && item.marca !== marca) return false;
      if (sede && item.sede !== sede) return false;
      if (almacen && item.almacen !== almacen) return false;

      if (!searchLower) return true;

      return [
        item.vin,
        item.modelo,
        item.marca,
        item.numero_factura,
        item.serie_motor,
        item.solicitud,
        item.cliente,
        item.asesor,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(searchLower));
    });
  }, [items, search, estado, marca, sede, almacen]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryEntries.map(({ estado, total, color }) => (
          <MetricCard
            key={estado}
            title={estado}
            value={total}
            icon={PackageSearch}
            colorHex={color}
          />
        ))}
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={currentInventoryColumns}
          data={filteredItems}
          initialColumnVisibility={{
            numero_factura: false,
            fecha_emision: false,
            solicitud: false,
            cliente: false,
          }}
        >
          <FilterWrapper>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por VIN, modelo, factura, cliente..."
            />
            <SearchableSelect
              options={estadoOptions}
              value={estado}
              onChange={setEstado}
              placeholder="Estado"
              className="md:w-fit"
            />
            <SearchableSelect
              options={marcaOptions}
              value={marca}
              onChange={setMarca}
              placeholder="Marca"
              className="md:w-fit"
            />
            <SearchableSelect
              options={sedeOptions}
              value={sede}
              onChange={setSede}
              placeholder="Sede"
              className="md:w-fit"
            />
            <SearchableSelect
              options={almacenOptions}
              value={almacen}
              onChange={setAlmacen}
              placeholder="Almacén"
              className="md:w-fit"
            />
          </FilterWrapper>
        </DataTable>
      </div>
    </div>
  );
}
