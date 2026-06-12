import { useQuery } from "@tanstack/react-query";
import { PayrollRegisterResponse } from "./payroll-register.interface";
import { getPayrollRegister } from "./payroll-register.actions";
import { PAYROLL_REGISTER } from "./payroll-register.constant";

const { QUERY_KEY } = PAYROLL_REGISTER;

export const usePayrollRegister = (params?: Record<string, any>) => {
  return useQuery<PayrollRegisterResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPayrollRegister(params),
    refetchOnWindowFocus: false,
    enabled: !!params?.period_id || !!params?.company_id,
  });
};
