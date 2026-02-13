export interface HotelReservationRequest {
  hotel_agreement_id: number | null;
  ruc: string;
  hotel_name: string;
  address: string;
  phone: string;
  checkin_date: string | Date;
  checkout_date: string | Date;
  total_cost: number;
  receipt_file: File;
  notes?: string;
  document_number?: string;
}
