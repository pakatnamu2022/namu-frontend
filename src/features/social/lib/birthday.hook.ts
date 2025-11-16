import { useQuery } from "@tanstack/react-query";
import { PersonBirthdayResponse } from "./birthday.interface";
import { getBirthdays } from "./birthday.actions";

export const useBirthday = (params?: Record<string, any>) => {
  return useQuery<PersonBirthdayResponse>({
    queryKey: ["birthday", params],
    queryFn: () => getBirthdays(),
    refetchOnWindowFocus: false,
  });
};
