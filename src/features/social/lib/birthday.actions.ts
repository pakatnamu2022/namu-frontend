import { api } from "@/core/api";
import type { PersonBirthdayResponse } from "./birthday.interface";
import type { AxiosRequestConfig } from "axios";

export async function getBirthdays(): Promise<PersonBirthdayResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: 5,
    },
  };
  const { data } = await api.get<PersonBirthdayResponse>(
    "/person/birthdays",
    config
  );
  return data;
}
