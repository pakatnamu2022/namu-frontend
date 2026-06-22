import { useQuery } from "@tanstack/react-query";
import { MANUALS } from "./manuales.constants";
import { ManualResource } from "./manuales.interface";
import { getManuals } from "./manuales.actions";

export const useManuals = (company: string, module: string) => {
  return useQuery<ManualResource[]>({
    queryKey: [MANUALS.QUERY_KEY, company, module],
    queryFn: () => getManuals({ company, module }),
    refetchOnWindowFocus: false,
    enabled: !!company && !!module,
  });
};
