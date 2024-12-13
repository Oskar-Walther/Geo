const mapLayer = "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const cover = document.querySelector(".cover");
const confirm = document.querySelector(".confirm");

let image = new Image;
image.src = "/images/location-sign-svgrepo-com.svg";

let image2 = new Image;
image2.src = "/images/my-location-svgrepo-com.svg";

var map = L.map('map', {
    center: [52.52, 13.405], 
    zoom: 4,
    maxBounds: [],
    maxBoundsViscosity: 0, 
});


L.tileLayer(mapLayer, {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    maxZoom: 7,
    minZoom: 4,
    subdomains: 'abcd'
}).addTo(map);

// Nordkap location
const nordkap = [71.15939141681443, 25.488281250000004];
let currentLine = null;
let currentImg = null;

const maxpoints = 5000;
const minpoints = 0;
let lat, lng;

let customIcon = L.icon({
    iconUrl: image.src, 
    iconSize: [38, 95], 
    iconAnchor: [38/2, 95/1.5], 
    popupAnchor: [-3, -76] 
});

let customIcon2 = L.icon({
    iconUrl: image2.src, // URL of the custom icon
    iconSize: [38, 38], // Icon size [width, height]
    iconAnchor: [38/2, 38/2], // Point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // Point from which the popup should open relative to the iconAnchor
});

map.on('click', function(e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    confirm.classList.remove("hide");

    if (currentImg) {
        map.removeLayer(currentImg);
    }

    currentImg = L.marker([lat,lng], { icon: customIcon2 }).addTo(map);
    
});



function resort(){
    if (currentLine) {
        map.removeLayer(currentLine);
    }

    L.marker([nordkap[0],nordkap[1]], { icon: customIcon }).addTo(map);
    currentLine = L.polyline([[lat, lng], nordkap], { color: 'red', weight: 2 }).addTo(map);
    const elementmap = map.getContainer();
    map.invalidateSize();
    map.flyTo([nordkap[0],nordkap[1]],6);
    
    function applyScore(score, distance){
        const scorelabel = document.querySelector(".score");
        const distancelabel = document.querySelector(".distance");

        scorelabel.textContent = `Score: ${score}`;
        distancelabel.textContent = `${distance} km`;
    }

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

    applyScore(result, distance)

    if(result <= 0) result = 0;
    console.log(result);
    map.off('click');

    setTimeout(() => {
        cover.classList.remove("hide");
        confirm.classList.add("hide");
    }, 0);
}
