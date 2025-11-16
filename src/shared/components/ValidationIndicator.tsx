interface ValidationIndicatorProps {
  isValidating: boolean;
  isValid?: boolean;
  hasError?: boolean;
  show?: boolean;
}

export function ValidationIndicator({
  isValidating,
  isValid = false,
  hasError = false,
  show = true,
}: ValidationIndicatorProps) {
  if (!show) return null;

  return (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      {isValidating && (
        <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
      )}
      {isValid && <div className="text-green-500">✓</div>}
      {hasError && <div className="text-red-500">✗</div>}
    </div>
  );
}
