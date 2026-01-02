export interface HotelReservationRequest {
  hotel_agreement_id: number | null;
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
