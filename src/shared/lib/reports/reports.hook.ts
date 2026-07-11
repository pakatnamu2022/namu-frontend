import { useMutation, useQuery } from "@tanstack/react-query";
import { downloadReport, fetchSelectOptions } from "./reports.actions";
import { errorToast, successToast } from "@/core/core.function";

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: ({
      endpoint,
      params,
    }: {
      endpoint: string;
      params: Record<string, any>;
    }) => downloadReport(endpoint, params),
    onSuccess: () => {
      successToast("El reporte se ha descargado correctamente");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Ocurrió un error al descargar el reporte",
      );
    },
  });
};

export const useSelectOptions = (endpoint?: string) => {
  return useQuery({
    queryKey: ["select-options", endpoint],
    queryFn: () => fetchSelectOptions(endpoint!),
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
