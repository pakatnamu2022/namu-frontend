import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getDailyDeliveryReport,
  exportDailyDeliveryToExcel,
} from "./daily-delivery.actions";
import { DailyDeliveryResponse } from "./daily-delivery.interface";
export const useDailyDelivery = (dateFrom?: string, dateTo?: string) => {
  return useQuery<DailyDeliveryResponse>({
    queryKey: ["daily-delivery", dateFrom, dateTo],
    queryFn: () => getDailyDeliveryReport(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useExportDailyDelivery = () => {
  return useMutation({
    mutationFn: ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) =>
      exportDailyDeliveryToExcel(dateFrom, dateTo),
  });
};
