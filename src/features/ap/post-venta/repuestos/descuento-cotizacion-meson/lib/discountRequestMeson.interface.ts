export interface DiscountRequestOrderQuotationResource {
  id: number;
  type: "GLOBAL" | "PARTIAL";
  ap_order_quotation_id: number | null;
  ap_order_quotation_detail_id: number | null;
  manager_id: number | null;
  reviewed_by_id: number | null;
  request_date: string | null;
  requested_discount_percentage: number;
  requested_discount_amount: number;
  review_date: string | null;
  is_approved: boolean;
  item_type: "PRODUCT" | "LABOR";
  status: "pending" | "approved" | "rejected";
}

export interface DiscountRequestOrderQuotationRequest {
  type: "GLOBAL" | "PARTIAL";
  requested_discount_percentage: number;
  requested_discount_amount: number;
  ap_order_quotation_id?: number | null;
  ap_order_quotation_detail_id?: number | null;
  item_type: "PRODUCT" | "LABOR";
}

export interface getDiscountRequestOrderProps {
  params?: Record<string, any>;
}
