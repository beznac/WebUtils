let map;
let isTrackingLocked = true; // Tracks if map should follow user

function initMap() {
    map = L.map('map', { zoomControl: false }).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Break map lock if user manually pans or zooms
    const breakLockEvents = ['dragstart', 'zoomstart', 'movestart'];
    breakLockEvents.forEach(eventType => {
        map.on(eventType, () => {
            if (map._manualInteraction) {
                isTrackingLocked = false;
            }
        });
    });

    map.on('mousedown touchstart', () => { map._manualInteraction = true; });
    map.on('zoomend moveend', () => { map._manualInteraction = false; });

    document.getElementById('recenter-btn').addEventListener('click', () => {
        isTrackingLocked = true;
        triggerRecenter();
    });
}

initMap();
