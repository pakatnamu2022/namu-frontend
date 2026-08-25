import { useEffect, useRef, useState } from "react";
import { FormInput } from "./FormInput";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChangeRef.current(inputValue);
    }, 10);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <FormInput
      label={label}
      name="search"
      className={cn("w-full h-7 text-[11px] md:h-7 md:text-xs", className)}
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      addonStart={<Search size="16" />}
      required
    />
  );
}
