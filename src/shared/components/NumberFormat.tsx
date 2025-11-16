interface NumberFormatProps {
  value: number | string | null | undefined;
  decimals?: number;
  locale?: string;
}

/**
 * Componente para formatear números con separador de miles
 * Similar a los pipes de Angular (DecimalPipe)
 *
 * @param value - El valor numérico a formatear
 * @param decimals - Número de decimales a mostrar (por defecto 2)
 * @param locale - Locale para el formato (por defecto 'es-PE')
 *
 * @example
 * <NumberFormat value={1234567.89} /> // "1,234,567.89"
 * <NumberFormat value={1234567.89} decimals={0} /> // "1,234,568"
 * <NumberFormat value="1234567" decimals={2} /> // "1,234,567.00"
 */
export const NumberFormat = ({
  value,
  decimals = 2,
  locale = 'es-PE'
}: NumberFormatProps) => {
  if (value === null || value === undefined || value === '') {
    return <span>-</span>;
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return <span>-</span>;
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);

  return <span>{formatted}</span>;
};
