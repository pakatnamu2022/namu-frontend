"use client";

import { UseFormReturn } from "react-hook-form";

interface FormDebugPanelProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
  show?: boolean;
}

/**
 * Panel de debug para formularios React Hook Form
 * Muestra el estado de validación, errores y valores del formulario
 *
 * @example
 * ```tsx
 * <FormDebugPanel
 *   form={form}
 *   isSubmitting={isSubmitting}
 *   show={process.env.NODE_ENV === 'development'} // Solo en desarrollo o le puedes poner True
 * />
 * ```
 */
export const FormDebugPanel = ({
  form,
  isSubmitting = false,
  show = true,
}: FormDebugPanelProps) => {
  if (!show) return null;

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-xs space-y-2">
      <p className="font-bold text-sm">🐛 DEBUG - Estado del Formulario</p>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2 rounded">
          <span className="font-semibold">✅ isValid:</span>{" "}
          <span
            className={`font-bold ${
              form.formState.isValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {form.formState.isValid ? "SI" : "NO"}
          </span>
        </div>

        <div className="bg-white p-2 rounded">
          <span className="font-semibold">📝 isDirty:</span>{" "}
          <span
            className={`font-bold ${
              form.formState.isDirty ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {form.formState.isDirty ? "SI" : "NO"}
          </span>
        </div>

        <div className="bg-white p-2 rounded">
          <span className="font-semibold">🔄 isSubmitting:</span>{" "}
          <span
            className={`font-bold ${
              isSubmitting ? "text-orange-600" : "text-gray-600"
            }`}
          >
            {isSubmitting ? "SI" : "NO"}
          </span>
        </div>
      </div>

      {hasErrors && (
        <div className="bg-white p-3 rounded">
          <p className="font-bold text-red-600 mb-2">
            ❌ Errores de validación (
            {Object.keys(form.formState.errors).length}):
          </p>
          <pre className="bg-red-50 p-2 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(form.formState.errors, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            console.log("=== FORM DEBUG ===");
            console.log("Form Values:", form.getValues());
            console.log("Form State:", form.formState);
            console.log("Form Errors:", form.formState.errors);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          📋 Ver valores en consola
        </button>

        <button
          type="button"
          onClick={() => {
            const values = form.getValues();
            navigator.clipboard.writeText(JSON.stringify(values, null, 2));
            alert("Valores copiados al portapapeles");
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          📋 Copiar valores
        </button>

        <button
          type="button"
          onClick={() => form.trigger()}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          🔄 Re-validar
        </button>
      </div>

      <p className="text-yellow-700 text-xs italic">
        ⚠️ Este panel es temporal para debugging. Recuerda eliminarlo en
        producción.
      </p>
    </div>
  );
};
