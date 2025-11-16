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
    <div className={`absolute ${leftPosition} whitespace-nowrap`}>
      {(!documentNumber ||
        (documentNumber.length === expectedDigits && !isValidating)) && (
        <span className="text-xs text-primary bg-blue-50 px-2 rounded">
          Automático
        </span>
      )}

      {documentNumber &&
        documentNumber.length > 0 &&
        documentNumber.length < expectedDigits && (
          <span className="text-xs text-gray-500">
            Faltan {expectedDigits - documentNumber.length} dígitos
          </span>
        )}

      {isValidating && (
        <span className="text-xs text-amber-600 bg-amber-50 px-2 rounded animate-pulse">
          Validando...
        </span>
      )}
    </div>
  );
};
