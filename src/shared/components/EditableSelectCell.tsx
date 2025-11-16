// components/EditableCell.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "./SearchableSelect";
import { Option } from "@/core/core.interface";

type Props = {
  id: number;
  value: number | string | null | undefined;
  onUpdate: (id: number, value: number | string) => void;
  widthClass?: string;
  options?: Option[];
};

export function EditableSelectCell({
  id,
  value,
  onUpdate,
  widthClass = "w-16",
  options = [],
}: Props) {
  const [editing, setEditing] = useState(false);
  const [initial, setInitial] = useState<string>(String(value ?? "")); // valor al entrar a actualizar

  useEffect(() => {
    setInitial(String(value ?? ""));
    setEditing(false);
  }, [id, value]);

  const startEdit = () => {
    setInitial(String(value ?? ""));
    setEditing(true);
  };

  const parseNum = (s: string) => Number(s.replace(",", ".").trim());

  const commit = (val: string) => {
    const next = val.trim();
    // si no cambió, no llames onUpdate
    if (next === initial.trim()) {
      setEditing(false);
      return;
    }
    const num = parseNum(next);
    if (!Number.isNaN(num)) {
      onUpdate(id, num);
    } else {
      onUpdate(id, next);
    }
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("font-semibold h-7 text-xs", widthClass)}
        onClick={startEdit}
        title="Editar meta"
      >
        {String(options.find((o) => o.value === String(value))?.label ?? "—")}
      </Button>
    );
  }

  /**
   * 
    <Input
      autoFocus
      value={val}
      className={cn("h-7 focus-visible:ring-tertiary", widthClass)}
      onChange={(e) => setVal(e.target.value)} // ← ya NO llama onUpdate aquí
      onBlur={commit} // ← confirma al salir
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(); // ← confirma con Enter
        if (e.key === "Escape") cancel(); // ← cancela con Esc
      }}
      inputMode="decimal"
      placeholder="0"
    />
   */

  return (
    <SearchableSelect
      classNameOption="text-xs"
      className="h-7 text-xs md:w-full"
      options={options}
      onChange={(val) => {
        commit(val);
      }}
      value={String(value ?? "")}
      onBlur={cancel}
      placeholder="Selecciona una opción"
    />
  );
}
