
const CACHE_NAME = 'flotasegura-v1';
const SYNC_TAG = 'location-sync';
const API_URL = '/api/tp/comercial/public/monitoreo/location';

self.addEventListener('install', event => {
    console.log('[SW] Instalado');
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    console.log('[SW] Activado');
    event.waitUntil(clients.claim());
});


self.addEventListener('message', event => {
    if (event.data.type === 'SAVE_LOCATION') {
        saveLocationToQueue(event.data.payload);
    }
});


self.addEventListener('sync', event => {
    if (event.tag === SYNC_TAG) {
        console.log('[SW] Sync ejecutado');
        event.waitUntil(sendPendingLocations());
    }
});


self.addEventListener('periodicsync', event => {
    if (event.tag === SYNC_TAG) {
        console.log('[SW] Periodic sync ejecutado');
        event.waitUntil(getCurrentLocationAndSync());
    }
});


function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FlotaSeguraDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('locations')) {
                db.createObjectStore('locations', { keyPath: 'id' });
            }
        };
    });
}

async function saveLocationToQueue(location) {
    const db = await openDB();
    const tx = db.transaction('locations', 'readwrite');
    const store = tx.objectStore('locations');
    await store.add({ ...location, id: Date.now(), retries: 0 });
    await tx.done;
    await self.registration.sync.register(SYNC_TAG);
}

async function sendPendingLocations() {
    const db = await openDB();
    const locations = await db.getAll('locations');

    for (const location of locations) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(location.data)
            });

            if (response.ok) {
                await db.delete('locations', location.id);
            } else if (location.retries >= 3) {
                await db.delete('locations', location.id);
            } else {
                await db.put('locations', { ...location, retries: location.retries + 1 });
            }
        } catch (error) {
            console.error('[SW] Error enviando ubicación:', error);
        }
    }
}

async function getCurrentLocationAndSync() {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
        client.postMessage({ type: 'REQUEST_LOCATION' });
    }
}