export type PhotoType = "start" | "end" | "fuel" | "incident" | "invoice";

export interface PhotoMetadata {
  latitude?: number;
  longitude?: number;
  userAgent?: string;
  operatingSystem?: string;
  browser?: string;
  deviceModel?: string;
  notes?: string;
}

export interface TravelPhoto {
  id: number;
  dispatch_id: number;
  driver_id: number;
  photo_type: PhotoType;
  photo_type_label: string;
  file_name: string;
  path: string;
  public_url: string;
  mime_type: string;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  operating_system: string | null;
  browser: string | null;
  device_model: string | null;
  notes: string | null;
  created_by: string;
  has_geolocation: boolean;
  formattedDate: string;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  deviceModel: string | null;
  operatingSystem: string | null;
  userAgent: string | null;
}

export interface PhotoStats {
  total_photos: number;
  photos_by_type: Record<PhotoType, number>;
  with_geolocation: number;
  no_geolocation: number;
  stats?: {
    geolocation_percentage: number;
    completion_rate: number;
    missing_types: string[];
  };
  breakdown?: {
    start_photos: number;
    end_photos: number;
    fuel_photos: number;
    incident_photos: number;
    invoice_photos: number;
  };
}
