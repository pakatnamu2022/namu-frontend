import { api } from "@/core/api";

export type PhotoType = 'start' | 'end' | 'fuel' | 'incident' | 'invoice';

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

export async function uploadPhoto(
    travelId: number,
    photoBase64: string,
    photoType: PhotoType,
    metadata: PhotoMetadata = {}
): Promise<{ data: TravelPhoto; message: string }> {
    try {
        let fotoData = photoBase64;
        if (!photoBase64.startsWith('data:')) {
            fotoData = `data:image/jpeg;base64,${photoBase64}`;
        }
        
        const userAgent = metadata.userAgent || navigator.userAgent;
        const deviceInfo = parseUserAgent(userAgent);

        const response = await api.post<{ data: TravelPhoto; message: string }>(
            `/tp/comercial/control-travel/${travelId}/photos`,
            {
                photo: fotoData,
                photo_type: photoType,
                latitude: metadata.latitude,
                longitude: metadata.longitude,
                user_agent: userAgent,
                operating_system: deviceInfo.operatingSystem || metadata.operatingSystem,
                browser: deviceInfo.browser || metadata.browser,
                device_model: deviceInfo.device_model || metadata.deviceModel,
                notes: metadata.notes
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error al registrar la foto: ', error);
        throw new Error(error.response?.data?.message || 'Error al subir la foto');
    }
}

export function parseUserAgent(userAgent: string): {
    operatingSystem: string;
    browser: string;
    device_model: string;
} {
    const info = {
        operatingSystem: 'Desconocido',
        browser: 'Desconocido',
        device_model: 'Desconocido'
    };

    if (userAgent.includes('iPhone')) {
        info.operatingSystem = 'iOS';
        if (userAgent.match(/iPhone\s+\d+/)) {
            const match = userAgent.match(/iPhone\s+(\d+)/);
            info.device_model = `iPhone ${match ? match[1] : ''}`;
        }
    } else if (userAgent.includes('Android')) {
        info.operatingSystem = 'Android';
        if (userAgent.includes('Samsung')) {
            info.device_model = 'Samsung Galaxy';
        }
    } else if (userAgent.includes('Windows')) {
        info.operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac')) {
        info.operatingSystem = 'macOS';
    }

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        info.browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        info.browser = 'Safari';
    } else if (userAgent.includes('Firefox')) {
        info.browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
        info.browser = 'Edge';
    }

    return info;
}

export async function uploadMultiplePhotos(
    travelId: number,
    photos: Array<{
        photo: string;
        photo_type: PhotoType;
        latitude?: number;
        longitude?: number;
        user_agent?: string;
        operating_system?: string;
        browser?: string;
        device_model?: string;
        notes?: string;
    }>
): Promise<any> {
    try {
        const processPhotos = photos.map(photo => ({
            ...photo,
            photo: photo.photo.startsWith('data:') ? photo.photo : `data:image/jpeg;base64,${photo.photo}`
        }));
        
        const response = await api.post(
            `/tp/comercial/control-travel/${travelId}/photos/multiple`, 
            { photos: processPhotos }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error uploading multiple photos:', error);
        throw new Error(error.response?.data?.message || 'Error al subir las fotos');
    }
}

export async function getPhotos(
    travelId: number,
    filters?: {
        photo_type?: PhotoType;
        driverId?: number;
        begin_date?: string;
        finish_date?: string;
    }
): Promise<TravelPhoto[]> {
    try {
        const params = new URLSearchParams();

        if (filters?.photo_type) params.append('photo_type', filters.photo_type);
        if (filters?.driverId) params.append('driver_id', filters.driverId.toString());
        if (filters?.begin_date) params.append('begin_date', filters.begin_date);
        if (filters?.finish_date) params.append('finish_date', filters.finish_date);

        const query = params.toString() ? `?${params.toString()}` : '';

        const response = await api.get<{ data: TravelPhoto[] }>(
            `/tp/comercial/control-travel/${travelId}/photos${query}`
        );
        
        return response.data.data;
    } catch (error: any) {
        console.error('Error al obtener las fotos', error);
        throw new Error(error.response?.data?.message || 'Error en recuperar las fotos');
    }
}

export async function getPhotoStats(travelId: number): Promise<PhotoStats> {
    try {
        const response = await api.get<{ data: PhotoStats }>(
            `/tp/comercial/control-travel/${travelId}/photos/statistics`
        );
        return response.data.data;
    } catch (error: any) {
        console.error('Error getting photo stats:', error);
        throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de fotos');
    }
}

export async function deletePhoto(fotoId: number): Promise<{ message: string }> {
    try {
        const response = await api.delete<{ message: string }>(`/tp/comercial/photos/${fotoId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting photo:', error);
        throw new Error(error.response?.data?.message || 'Error al eliminar la foto');
    }
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocalizacion no soportada');
            resolve(null);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const timeoutId = setTimeout(() => {
            console.warn('Timeout obteniendo ubicacion');
            resolve(null);
        }, 10000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                clearTimeout(timeoutId);
                console.warn('Error obteniendo ubicacion:', error.message);
                resolve(null);
            },
            options
        );
    });
}