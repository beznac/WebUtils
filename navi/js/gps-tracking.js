let userMarker = null;
let lastPosition = null;

const gpsArrowIcon = L.divIcon({
    className: 'gps-arrow-marker',
    html: `
    <div style="transform: rotate(0deg); transition: transform 0.2s ease; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#007AFF" stroke="white" stroke-width="2" stroke-linejoin="round"/>
    </svg>
    </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Calculate bearing heading between two coordinates
function calculateHeading(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function updateMarkerRotation(degrees) {
    const element = document.querySelector('.gps-arrow-marker div');
    if (element) {
        element.style.transform = `rotate(${degrees}deg)`;
    }
}

function onLocationSuccess(position) {
    const { latitude, longitude, heading } = position.coords;
    const currentLatLng = [latitude, longitude];

    if (!userMarker) {
        userMarker = L.marker(currentLatLng, { icon: gpsArrowIcon }).addTo(map);
        map.setView(currentLatLng, 16);
    } else {
        userMarker.setLatLng(currentLatLng);
    }

    // Determine heading using device hardware, or fallback to calculation delta
    if (heading !== null && heading !== undefined) {
        updateMarkerRotation(heading);
    } else if (lastPosition) {
        const calculatedHeading = calculateHeading(lastPosition.latitude, lastPosition.longitude, latitude, longitude);
        if (Math.abs(latitude - lastPosition.latitude) > 0.00001 || Math.abs(longitude - lastPosition.longitude) > 0.00001) {
            updateMarkerRotation(calculatedHeading);
        }
    }

    if (isTrackingLocked) {
        map._manualInteraction = false;
        map.panTo(currentLatLng);
    }

    lastPosition = { latitude, longitude };
}

function triggerRecenter() {
    if (lastPosition) {
        map.setView([lastPosition.latitude, lastPosition.longitude], 17);
    }
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(onLocationSuccess, (err) => console.error(err), {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
    });
}
