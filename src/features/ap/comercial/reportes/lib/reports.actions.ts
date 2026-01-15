import { api } from "@/core/api";

export const downloadReport = async (
  endpoint: string,
  params: Record<string, any>
) => {
  const response = await api.post(endpoint, params, {
    responseType: "blob",
  });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;

  // Extraer el nombre del archivo del header Content-Disposition si está disponible
  const contentDisposition = response.headers["content-disposition"];
  let filename = "reporte";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
  } else {
    // Generar nombre basado en el formato
    const extension = params.format === "pdf" ? "pdf" : "xlsx";
    filename = `reporte_${new Date().getTime()}.${extension}`;
  }

  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Liberar el objeto URL
  window.URL.revokeObjectURL(url);

  return response.data;
};

export const fetchSelectOptions = async (endpoint: string) => {
  const response = await api.get(endpoint);
  return response.data;
};
