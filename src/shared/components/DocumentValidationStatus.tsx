import { Badge } from "@/components/ui/badge";

interface DocumentValidationStatusProps {
  shouldValidate: boolean;
  documentNumber: string;
  expectedDigits: number;
  isValidating: boolean;
  leftPosition?: string; // Nueva prop opcional
}

export const DocumentValidationStatus = ({
  shouldValidate,
  documentNumber,
  expectedDigits,
  isValidating,
  leftPosition = "left-36", // Valor por defecto
}: DocumentValidationStatusProps) => {
  if (!shouldValidate) return null;

  return (
    <div className={`${leftPosition} whitespace-nowrap`}>
      {(!documentNumber ||
        (documentNumber.length === expectedDigits && !isValidating)) && (
        <Badge color="blue" size="xs" className="rounded-sm py-0 md:px-2">
          Automático
        </Badge>
      )}

      {documentNumber &&
        documentNumber.length > 0 &&
        documentNumber.length < expectedDigits && (
          <Badge color="red" size="xs" className="rounded-sm py-0 md:px-2">
            {`Falta${expectedDigits - documentNumber.length === 1 ? "" : "n"}`}{" "}
            {expectedDigits - documentNumber.length}{" "}
            {`dígito${expectedDigits - documentNumber.length === 1 ? "" : "s"}`}
          </Badge>
        )}

      {isValidating && (
        <Badge
          color="amber"
          size="xs"
          className="rounded-sm py-0 md:px-2 animate-pulse"
        >
          Validando...
        </Badge>
      )}
    </div>
  );
};
