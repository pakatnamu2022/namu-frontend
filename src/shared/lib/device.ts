

const PERMISSION_TIMEOUT = 5000;
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: PERMISSION_TIMEOUT,
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