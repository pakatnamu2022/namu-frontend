export interface HotelReservationRequest {
  hotel_agreement_id: number | null;
  hotel_name: string;
  address: string;
  phone: string;
  checkin_date: string | Date;
  checkout_date: string | Date;
  total_cost: number;
  receipt_file?: File;
  notes?: string;
}

export interface HotelReservationResponse {
  id: number;
  per_diem_request_id: number;
  hotel_agreement_id: number | null;
  hotel_name: string;
  address: string;
  phone: string;
  checkin_date: string;
  checkout_date: string;
  nights_count: number;
  total_cost: number;
  receipt_path: string;
  notes: string;
  attended: boolean;
  penalty: number;
  created_at: string;
  updated_at: string;
}

export interface ActiveHotelAgreement {
  id: number;
  city: string;
  name: string;
  corporate_rate: string;
  features: string;
  includes_breakfast: boolean;
  includes_lunch: boolean;
  includes_dinner: boolean;
  includes_parking: boolean;
  email: string;
  phone: string;
  address: string;
  website: string;
  active: boolean;
}
