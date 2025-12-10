import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getDailyDeliveryReport,
  exportDailyDeliveryToExcel,
} from "./daily-delivery.actions";
import { DailyDeliveryResponse } from "./daily-delivery.interface";
import { useToast } from "@/hooks/use-toast";

export const useDailyDelivery = (dateFrom?: string, dateTo?: string) => {
  return useQuery<DailyDeliveryResponse>({
    queryKey: ["daily-delivery", dateFrom, dateTo],
    queryFn: () => getDailyDeliveryReport(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useExportDailyDelivery = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) =>
      exportDailyDeliveryToExcel(dateFrom, dateTo),
    onSuccess: () => {
      toast({
        title: "Exportación exitosa",
        description: "El reporte se ha descargado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al exportar",
        description:
          error.message || "Ocurrió un error al descargar el reporte",
        variant: "destructive",
      });
    },
  });
};
