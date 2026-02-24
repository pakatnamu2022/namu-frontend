export interface DiscountRequestWorkOrderQuotationResource {
  id: number;
  type: "GLOBAL" | "PARTIAL";
  ap_order_quotation_id: number | null;
  ap_order_quotation_detail_id: number | null;
  manager_id: number | null;
  approved_id: number | null;
  request_date: string | null;
  requested_discount_percentage: number;
  requested_discount_amount: number;
  approval_date: string | null;
  is_approved: boolean;
  item_type: "PRODUCT" | "LABOR";
}

export interface DiscountRequestWorkOrderQuotationRequest {
  type: "GLOBAL" | "PARTIAL";
  requested_discount_percentage: number;
  requested_discount_amount: number;
  ap_order_quotation_id?: number | null;
  ap_order_quotation_detail_id?: number | null;
  item_type: "PRODUCT" | "LABOR";
}
