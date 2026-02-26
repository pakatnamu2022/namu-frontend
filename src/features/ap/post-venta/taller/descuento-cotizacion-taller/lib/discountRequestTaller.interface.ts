export interface DiscountRequestWorkOrderQuotationResource {
  id: number;
  type: "GLOBAL" | "PARTIAL";
  ap_work_order_id: number;
  part_labour_id: number | null;
  part_labour_model: string | null;
  approved_id: number | null;
  request_date: string | null;
  requested_discount_percentage: number;
  requested_discount_amount: number;
  approval_date: string | null;
  is_approved: boolean;
  status: "pending" | "approved" | "rejected";
  item_type: "PRODUCT" | "LABOR";
}

export interface DiscountRequestWorkOrderQuotationRequest {
  type: "GLOBAL" | "PARTIAL";
  requested_discount_percentage: number;
  requested_discount_amount: number;
  ap_work_order_id?: number;
  part_labour_id?: number;
  part_labour_model?: string;
  item_type: "PRODUCT" | "LABOR";
}
