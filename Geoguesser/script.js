const mapLayer = "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const cover = document.querySelector(".cover");
const confirm = document.querySelector(".confirm");

// Initialize the map and set the view to the center of Europe
var map = L.map('map', {
    center: [52.52, 13.405], // Central coordinates for Europe (Berlin)
    zoom: 4,
    maxBounds: [], // Restrict panning to Europe (approximate bounds)
    maxBoundsViscosity: 0, // Adds a "rubber band" effect when hitting the bounds
});

// Add a tile layer to the map with OpenStreetMap tiles
L.tileLayer(mapLayer, {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    maxZoom: 7,
    minZoom: 4,
    subdomains: 'abcd'
}).addTo(map);

// Nordkap location
const nordkap = [71.15939141681443, 25.488281250000004];
let currentLine = null;

const maxpoints = 5000;
const minpoints = 0;
let lat, lng;

map.on('click', function(e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    confirm.classList.remove("hide");
});

function resort(){
    if (currentLine) {
        map.removeLayer(currentLine);
    }

    
    currentLine = L.polyline([[lat, lng], nordkap], { color: 'red', weight: 2 }).addTo(map);
    const elementmap = map.getContainer();
    elementmap.style.height = "50vh";
    map.invalidateSize();
    map.setView([nordkap[0],nordkap[1]],6);
    
    

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
    map.off('click');

    setTimeout(() => {
        cover.classList.remove("hide");
        confirm.classList.add("hide");
    }, 0);
}
