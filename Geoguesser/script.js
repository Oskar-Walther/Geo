const mapLayer =
  "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const cover = document.querySelector(".cover");
const confirm = document.querySelector(".confirm");

let image = new Image();
image.src = "/images/location-sign-svgrepo-com.svg";

let image2 = new Image();
image2.src = "/images/my-location-svgrepo-com.svg";

var map = L.map("map", {
  center: [52.52, 13.405],
  zoom: 4,
  maxBounds: [
    [75, -22],
    [30, 65],
  ],
  maxBoundsViscosity: 0,
});

L.tileLayer(mapLayer, {
  attribution: '&copy; <a href="https://carto.com/">Carto</a>',
  maxZoom: 7,
  minZoom: 4,
  subdomains: "abcd",
}).addTo(map);

var polygonCoords = [
  [56.26776108757582, 13.9306640625],
  [57.58655886615978, 12.612304687500002],
  [58.950008233357046, 11.77734375],
  [59.489726035537075, 10.590820312500002],
  [58.676937672586924, 9.008789062500002],
  [58.147518599073585, 7.514648437500001],
  [58.92733441827545, 6.1962890625],
  [60.52215754533236, 5.405273437500001],
  [61.62728646147466, 5.800781250000001],
  [62.91523303947614, 7.294921875000001],
  [63.58767529470318, 9.272460937500002],
  [64.66151739623564, 11.425781250000002],
  [66.24916310923315, 13.227539062500002],
  [66.79190947341796, 14.370117187500002],
  [69.00567519658819, 17.973632812500004],
  [70.3926061360023, 20.170898437500004],
  [70.83024762385253, 24.609375000000004],
  [70.97402838932706, 27.905273437500004],
  [69.17818443567216, 27.465820312500004],
  [66.58321725728176, 24.829101562500004],
  [65.91062334197893, 23.291015625000004],
  [65.25670649344259, 21.4453125],
  [64.28275952823397, 21.181640625000004],
  [63.66576033778838, 19.643554687500004],
  [62.87518837993309, 17.973632812500004],
  [61.689872200460016, 17.050781250000004],
  [59.84481485969108, 17.578125000000004],
  [59.06315402462662, 18.457031250000004],
  [56.897003921272606, 16.171875000000004],
  [56.26776108757582, 14.809570312500002],
];
let center = [62.90394634820554, 15.6328125];

let currentLine = null;
let currentImg = null;

const maxpoints = 5000;
const minpoints = 0;
let lat, lng;

let customIcon = L.icon({
  iconUrl: image.src,
  iconSize: [38, 95],
  iconAnchor: [38 / 2, 95 / 1.5],
  popupAnchor: [-3, -76],
});

let customIcon2 = L.icon({
  iconUrl: image2.src, // URL of the custom icon
  iconSize: [38, 38], // Icon size [width, height]
  iconAnchor: [38 / 2, 38 / 2], // Point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76], // Point from which the popup should open relative to the iconAnchor
});

map.on("click", function (e) {
  lat = e.latlng.lat;
  lng = e.latlng.lng;
  confirm.classList.remove("hide");

  if (currentImg) {
    map.removeLayer(currentImg);
  }

  currentImg = L.marker([lat, lng], { icon: customIcon2 }).addTo(map);
});

function resort() {
  const elementmap = map.getContainer();

  if (currentLine) {
    map.removeLayer(currentLine);
  }

  L.marker([center[0], center[1]], { icon: customIcon }).addTo(map);
  currentLine = L.polyline([[lat, lng], center], {
    color: "red",
    weight: 2,
  }).addTo(map);

  map.invalidateSize();
  map.flyTo([center[0], center[1]], 6);

  function applyScore(score, distance) {
    const scorelabel = document.querySelector(".score");
    const distancelabel = document.querySelector(".distance");

    scorelabel.textContent = `Score: ${score}`;
    distancelabel.textContent = `${distance} km`;
  }

  var polygon = L.polygon(polygonCoords);

  function isPointInPolygon(lat, lng, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i].lat, yi = coords[i].lng;
        const xj = coords[j].lat, yj = coords[j].lng;
        const intersect = ((yi > lng) !== (yj > lng)) &&
                          (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function calculateDistanceToPolygon(lat, lng) {
  const R = 6371; // Earth's radius in km
  const toRadians = (deg) => deg * Math.PI / 180;

  const haversine = (lat1, lng1, lat2, lng2) => {
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const pointToSegmentDist = (lat, lng, lat1, lng1, lat2, lng2) => {
      const t = Math.max(0, Math.min(1, ((lat - lat1) * (lat2 - lat1) + (lng - lng1) * (lng2 - lng1)) /
          ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)));
      const projLat = lat1 + t * (lat2 - lat1);
      const projLng = lng1 + t * (lng2 - lng1);
      return haversine(lat, lng, projLat, projLng);
  };

  const coords = polygon.getLatLngs()[0];

  // Check if point is inside the polygon
  if (isPointInPolygon(lat, lng, coords)) {
      return 0; // Distance is 0 if inside the polygon
  }

  return Math.round(
      Math.min(...coords.map((p, i) => {
          const next = coords[(i + 1) % coords.length];
          return pointToSegmentDist(lat, lng, p.lat, p.lng, next.lat, next.lng);
      }))
  );
}

  const distance = calculateDistanceToPolygon(lat, lng);
  console.log("Distance to nearest border: " + distance + " meters");

  console.log(`Distance: ${distance} km`);

  result = Calcresult(distance, 100, 0.8);

  function Calcresult(distance, radius, factor) {
    if (maxpoints - distance >= maxpoints - radius) {
      return maxpoints;
    } else {
      return Math.round(maxpoints - (distance - radius) / factor);
    }
  }

  applyScore(result, distance);

  if (result <= 0) result = 0;
  console.log(result);
  map.off("click");

  setTimeout(() => {
    cover.classList.remove("hide");
    confirm.classList.add("hide");
  }, 0);
}

function toggleFullscreen() {
  const button = document.querySelector(".fullscreen");
  if (!document.fullscreenElement) {
    // If not in fullscreen mode, request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      // Safari
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      // IE11
      document.documentElement.msRequestFullscreen();
    }
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z"/></svg>';
  } else {
    // If already in fullscreen mode, exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE11
      document.msExitFullscreen();
    }
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/></svg>';
  }
}

var drawControl = new L.Control.Draw({
  draw: {
    polyline: true, // Disable polyline
    circlemarker: true, // Disable circlemarker
    marker: true, // Disable marker
    circle: true, // Enable circle
    rectangle: true, // Enable rectangle
    polygon: true,
    // Enable polygon
  },
});

map.addControl(drawControl);

map.on("draw:created", function (e) {
  var type = e.layerType; // Type of shape ('polygon', 'rectangle', 'circle')
  var layer = e.layer; // The drawn shape layer

  // Add the drawn shape to the map
  map.addLayer(layer);
  let test = [];
  // Log the area parameters
  if (type === "polygon" || type === "rectangle") {
    // Log coordinates of the vertices
    var latLngs = layer.getLatLngs()[0]; // Outer ring of the polygon
    console.log("Polygon/Rectangle coordinates:");
    latLngs.forEach((latlng) => {
      let temp = [latlng.lat, latlng.lng];
      test.push(temp);
    });
    var geojson = layer.toGeoJSON(); // Convert the drawn layer to GeoJSON // Calculate the centroid
    var sumLat = 0,
      sumLng = 0;
    var numPoints = latLngs.length;

    latLngs.forEach(function (latlng) {
      sumLat += latlng.lat;
      sumLng += latlng.lng;
    });

    var centroidLat = sumLat / numPoints;
    var centroidLng = sumLng / numPoints;

    let center = [centroidLat, centroidLng];
    console.log(center);
  } else if (type === "circle") {
    // Log circle parameters
    var center = layer.getLatLng(); // Center of the circle
    var radius = layer.getRadius(); // Radius of the circle
    console.log("Circle Parameters:");
    console.log(`Center: Latitude ${center.lat}, Longitude ${center.lng}`);
    console.log(`Radius: ${radius} meters`);
  }

  console.log(test);
});
