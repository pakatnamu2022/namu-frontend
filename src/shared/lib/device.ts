
const STORAGE_KEY = "device_id";
const USER_AGENT_MAX_LENGTH = 50;
const PERMISSION_TIMEOUT = 5000;
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: PERMISSION_TIMEOUT,
}

function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}


export function getDeviceId(): string {
    let existingId = localStorage.getItem(STORAGE_KEY);

    if (existingId) {
        return existingId;
    }

    const newId = generateDeviceId();
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
}

function generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ua = navigator.userAgent.substring(0, USER_AGENT_MAX_LENGTH);

    // Crear un hash simple
    const data = `${timestamp}-${random}-${ua}`;
    let hash = simpleHash(data);

    return `pwa-${Math.abs(hash).toString(36)}-${timestamp}`;
}

export async function requestLocationPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
        console.warn("Geolocalización no soportada");
        return false;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
                console.error("Permiso denegado:", error);
                resolve(false);
            },
            HIGH_ACCURACY_OPTIONS
        );
    });
}

export function clearDeviceId(): void {
    localStorage.removeItem(STORAGE_KEY);
}