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
                            // Nordkap
const locations = [[71.15939141681443,25.488281250000004],]

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
    
    console.log(`Distance: ${Math.round(calculateDistance(lat, lng, locations[0][0], locations[0][1]))} km`); 
});
