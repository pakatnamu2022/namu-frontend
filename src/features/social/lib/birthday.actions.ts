import { api } from "@/core/api";
import { PersonBirthdayResponse } from "./birthday.interface";
import { AxiosRequestConfig } from "axios";

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
