// components/EditableCell.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  id: number;
  value: number | string | null | undefined;
  onUpdate: (id: number, value: any) => void;
  widthClass?: string;
  isNumber?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "neutral"
    | null
    | undefined;
  max?: number;
  min?: number;
  allowUpdateWithoutChange?: boolean; // si true, llama onUpdate aunque no haya cambios
};

export function UpdateableCell({
  id,
  value,
  onUpdate,
  widthClass = "w-16",
  isNumber = true,
  variant = "outline",
  max,
  min,
  allowUpdateWithoutChange = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<string>(String(value ?? ""));
  const [initial, setInitial] = useState<string>(String(value ?? "")); // valor al entrar a actualizar

  useEffect(() => {
    setVal(String(value ?? ""));
    setInitial(String(value ?? ""));
    setEditing(false);
  }, [id, value]);

  const startEdit = () => {
    setInitial(String(value ?? ""));
    setVal(String(value ?? ""));
    setEditing(true);
  };

  const parseNum = (s: string) => Number(s.replace(",", ".").trim());

  const commit = () => {
    const next = val.trim();
    const num = parseNum(next);

    // si no cambió, no llames onUpdate
    if (next === initial.trim() && !allowUpdateWithoutChange) {
      setEditing(false);
      return;
    }

    if (isNumber && !Number.isNaN(num)) {
      onUpdate(id, num);
    } else {
      onUpdate(id, next);
    }
    setEditing(false);
  };

  const cancel = () => {
    setVal(initial); // volvemos al valor original
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={cn("font-semibold h-7", widthClass)}
        onClick={startEdit}
        title={"Haga clic para actualizar"}
      >
        {String(value ?? "—")}
      </Button>
    );
  }

  return (
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
      type={isNumber ? "number" : "text"}
      min={isNumber ? min : undefined}
      max={isNumber ? max : undefined}
    />
  );
}
