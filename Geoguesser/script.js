// Initialize the map and set the view to the center of Europe
var map = L.map('map', {
    center: [52.52, 13.405], // Central coordinates for Europe (Berlin)
    zoom: 4,
    maxBounds: [[66.30221, -23.46680], [36.80928, 45.35156]], // Restrict panning to Europe (approximate bounds)
    maxBoundsViscosity: 0, // Adds a "rubber band" effect when hitting the bounds
});

// Add a tile layer to the map with OpenStreetMap tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    maxZoom: 6,
    minZoom: 4,
    subdomains: 'abcd'
}).addTo(map);

// Nordkap location
const nordkap = [71.15939141681443, 25.488281250000004];
let currentLine = null;

const maxpoints = 5000;
const minpoints = 0;

map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const toRadians = (degree) => degree * (Math.PI / 180);
    
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
    
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        return R * c; // Distance in kilometers
    }

    // Calculate distance
    const distance = Math.round(calculateDistance(lat, lng, nordkap[0], nordkap[1]));
    console.log(`Distance: ${distance} km`);

    // Remove the previous line if it exists
    if (currentLine) {
        map.removeLayer(currentLine);
    }

    // Draw a new line between the clicked point and Nordkap
    currentLine = L.polyline([[lat, lng], nordkap], { color: 'red', weight: 2 }).addTo(map);

    result = Calcresult(distance, 100, 0.8)

    function Calcresult(distance, radius, factor){
        if(maxpoints - distance >= maxpoints - radius){
            return maxpoints;
        } else{
            return Math.round((maxpoints - (distance - radius) / factor));
        }
        
    }

    if(result <= 0) result = 0;
    console.log(result);
    
});
