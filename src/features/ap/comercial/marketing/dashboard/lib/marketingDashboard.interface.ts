export interface MarketingDashboardResponse {
  year: number;
  plans_count: number;
  plans: Array<{
    id: number;
    name: string;
    brand_id: number | null;
    status: string | null;
    budgets_count: number;
  }>;
  budget_totals: Array<{
    status: string;
    total_estimated: number;
    total_executed: number;
  }>;
  activities_status: Array<{ status: string; total: number }>;
  orders_status: Array<{ status: string; total: number; total_amount: number }>;
  kpi_totals: {
    total_leads: number;
    total_sales: number;
    total_investment: number;
    conversion_rate: number;
    cost_per_lead: number;
    cost_per_sale: number;
  };
  kpis_by_channel: Array<{
    channel: string;
    total_leads: number;
    total_sales: number;
    total_investment: number;
    conversion_rate: number;
    cost_per_lead: number;
  }>;
  top_activities: Array<{
    id: number;
    name: string;
    channel: string | null;
    total_leads: number;
    total_sales: number;
    total_investment: number;
    conversion_rate: number;
    cost_per_lead: number;
  }>;
}

export interface MarketingDashboardMonthlyResponse {
  year: number;
  brand_id: number | null;
  monthly_budgets: Array<{
    period_month: number;
    estimated: number;
    executed: number;
  }>;
  monthly_kpis: Array<{
    period_month: number;
    total_leads: number;
    total_sales: number;
    total_investment: number;
  }>;
  by_brand: Array<{
    plan_id: number;
    plan_name: string;
    brand_id: number | null;
    brand_name: string | null;
    concept: string | null;
    amount_estimated: number;
    amount_executed: number;
    activities_count: number;
    orders_total: number;
  }>;
}
