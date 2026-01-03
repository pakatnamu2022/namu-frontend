const API_BASE = '/api/tp/comercial';

export const travelPhoto = {
    async uploadPhoto(
        travelId: number,
        photoBase64: string,
        photoType: 'start' | 'end' | 'fuel' | 'incident' | 'invoice',
        metadata: {
            latitude?: number;
            longitude?: number;
            userAgent?: string;
            operatingSystem?: string;
            browser?: string;
            deviceModel?: string;
            notes?: string
        } = {}
    ){
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE}/control-travel/${travelId}/photos`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                photo: photoBase64,
                photo_type: photoType,
                latitude: metadata.latitude,
                longitude: metadata.longitude,
                user_agent: metadata.userAgent,
                operating_system: metadata.operatingSystem,
                browser: metadata.browser,
                device_model: metadata.deviceModel,
                notes: metadata.notes
            })
        });

        if(!response.ok){
            const error = await response.json();
            throw new Error(error.message || 'Error al subir la foto');
        }

        return await response.json();
    },

    async getPhotos(travelId:number, filters?: {
        photoType?: string;
        driverId?: number;
        beginDate?: string;
        finishDate?: string;
    }){
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        
        if (filters?.photoType) params.append('photo_type', filters.photoType);
        if (filters?.driverId) params.append('driver_id', filters.driverId.toString());
        if (filters?.beginDate) params.append('begin_date', filters.beginDate);
        if (filters?.finishDate) params.append('finish_date', filters.finishDate);
        
        const query = params.toString() ? `?${params.toString()}` : '';


        const response = await fetch(`${API_BASE}/control-travel/${travelId}/photos${query}`,{
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error("Error al obtener las fotos");
        }

        return await response.json();
    },

    async deletePhoto(photoId: number){
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/photos/${photoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar la foto');
        }
        
        return await response.json();
    },
    async uploadMultiplePhotos(
        travelId: number,
        photos: Array<{
            photo: string;
            photo_type: string;
            latitude?: number;
            longitude?: number;
            notes?: string;
        }>
    ) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/control-travel/${travelId}/photos/multiple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ photos })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al subir las fotos');
        }
        
        return await response.json();
    }
};