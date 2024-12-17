const mapLayer =
  "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const cover = document.querySelector(".cover");
const confirm = document.querySelector(".confirm");
const tasklabel = document.querySelector(".task");
const debug = true;

let image = new Image();
image.src = "../images/location-sign-svgrepo-com.svg";

let image2 = new Image();
image2.src = "../images/my-location-svgrepo-com.svg";

var map = L.map("map", {
  center: [52.52, 13.405],
  zoom: 4,
  maxBounds: [
    [34, -31],
    [72, 45],
  ],
  maxBoundsViscosity: 1,
});

L.tileLayer(mapLayer, {
  attribution: '&copy; <a href="https://carto.com/">Carto</a>',
  minZoom: 4,
  maxZoom: 10,
  subdomains: "abcd",
  noWrap: true,
}).addTo(map);

let polygonCoords;
let center;
let typeofshape;
let polygon;

getCoords("../data/data.json");


async function getCoords(file) {
  let x = await fetch(file);
  let y = await x.json();
  let locations = y.locations;

  let objects = Object.values(locations);
  let names = Object.keys(locations);

  let len = objects.length;

  let random = Math.floor(Math.random() * len);
  let geoobject = objects[random];
  let geoname = names[random];

  typeofshape = geoobject.type;

  center = geoobject.center;
  polygonCoords = geoobject.polygion;

  tasklabel.textContent = geoname.replace("-", " ");
}

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
    weight: 3,
  }).addTo(map);

  map.invalidateSize();
  map.flyTo([center[0], center[1]], 7);

  function applyScore(score, distance) {
    const scorelabel = document.querySelector(".score");
    const distancelabel = document.querySelector(".distance");

    scorelabel.textContent = `${score}`;
    distancelabel.textContent = `${distance} km`;
  }



  switch (true) {
    case typeofshape == "line":
      polygon = L.polyline(polygonCoords);
      break;

    case typeofshape == "marker":
      polygon = L.marker(polygonCoords);
      break;

    case typeofshape == "polygion":
      polygon = L.polygon(polygonCoords);
      break;

    default:
      alert("error");
      console.log(typeofshape);
  }

  if(debug){
    polygon.addTo(map);
  }

  function isPointInPolygon(lat, lng, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i].lat,
        yi = coords[i].lng;
      const xj = coords[j].lat,
        yj = coords[j].lng;
      const intersect =
        yi > lng !== yj > lng &&
        lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function calculateDistanceToPolygon(lat, lng) {
    const R = 6371; // Earth's radius in km
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const haversine = (lat1, lng1, lat2, lng2) => {
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const pointToSegmentDist = (lat, lng, lat1, lng1, lat2, lng2) => {
      const t = Math.max(
        0,
        Math.min(
          1,
          ((lat - lat1) * (lat2 - lat1) + (lng - lng1) * (lng2 - lng1)) /
            ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)
        )
      );
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
      Math.min(
        ...coords.map((p, i) => {
          const next = coords[(i + 1) % coords.length];
          return pointToSegmentDist(lat, lng, p.lat, p.lng, next.lat, next.lng);
        })
      )
    );
  }

  function calculateDistanceToLine(lat, lng) {
    // Convert lat/lng to radians
    const toRadians = (degree) => (degree * Math.PI) / 180;

    // Haversine distance function (in kilometers)
    const haversine = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    };

    // Helper function to calculate the distance from a point to a line segment
    const pointToLineDistance = (px, py, ax, ay, bx, by) => {
      const lineLength = haversine(ax, ay, bx, by);
      const u =
        ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) /
        (lineLength * lineLength);

      let closestX, closestY;

      if (u < 0) {
        // Closest to point A
        closestX = ax;
        closestY = ay;
      } else if (u > 1) {
        // Closest to point B
        closestX = bx;
        closestY = by;
      } else {
        // Closest to the projection of P on line AB
        closestX = ax + u * (bx - ax);
        closestY = ay + u * (by - ay);
      }

      return haversine(px, py, closestX, closestY);
    };

    // Iterate over each line segment in the polygon
    let minDistance = Infinity;
    for (let i = 0; i < polygonCoords.length; i++) {
      const [lat1, lng1] = polygonCoords[i];
      const [lat2, lng2] = polygonCoords[(i + 1) % polygonCoords.length]; // Wrap around to the first point

      // Calculate the distance from the user point to this line segment
      const dist = pointToLineDistance(lng, lat, lng1, lat1, lng2, lat2);

      // Update the minimum distance
      minDistance = Math.min(minDistance, dist);
    }

    return Math.floor(minDistance);
  }

  function calculateDistanceToPoint(lat1, lon1) {
    const toRadians = (degree) => (degree * Math.PI) / 180; // Helper function to convert degrees to radians

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(center[0] - lat1);
    const dLon = toRadians(center[1] - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(center[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return Math.floor(distance);
  }

  // Example usage with switch

  let distance;

  switch (true) {
    case typeofshape === "line":
      distance = calculateDistanceToLine(lat, lng);
      break;

    case typeofshape === "marker":
      distance = calculateDistanceToPoint(lat, lng);
      break;

    case typeofshape === "polygion":
      distance = calculateDistanceToPolygon(lat, lng);
      break;
  }

  //console.log(`Distance: ${distance} km`);

  result = Calcresult(distance, 100, 0.5);

  function Calcresult(distance, radius, factor) {
    if (maxpoints - distance >= maxpoints - radius) {
      return maxpoints;
    } else {
      return Math.max(0, Math.round(maxpoints - (distance - radius) / factor));
    }
  }

  applyScore(result, distance);

  if (result <= 0) result = 0;
  //console.log(result);
  map.off("click");

  setTimeout(() => {
    cover.classList.remove("hide");
    confirm.classList.add("hide");
    tasklabel.parentElement.classList.add("hide");
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
if (debug) {
  var drawControl = new L.Control.Draw({
    draw: {
      polyline: true, // Disable polyline
      circlemarker: false, // Disable circlemarker
      marker: true, // Disable marker
      circle: false, // Enable circle
      rectangle: false, // Enable rectangle
      polygon: true,
      // Enable polygon
    },
  });

  map.addControl(drawControl);

  map.on("draw:created", function (e) {
    var type = e.layerType; // Type of shape ('polygon', 'rectangle', 'circle')
    var layer = e.layer; // The drawn shape layer
    var center;
    let htype;
    // Add the drawn shape to the map
    map.addLayer(layer);
    let test = [];
    // Log the area parameters
    if (type === "polygon" || type === "rectangle") {
      var latLngs = layer.getLatLngs()[0];
      latLngs.forEach((latlng) => {
        let temp = [latlng.lat, latlng.lng];
        test.push(temp);
      });
      var sumLat = 0,
        sumLng = 0;
      var numPoints = latLngs.length;
      htype = "polygion";

      latLngs.forEach(function (latlng) {
        sumLat += latlng.lat;
        sumLng += latlng.lng;
      });

      var centroidLat = sumLat / numPoints;
      var centroidLng = sumLng / numPoints;

      center = [centroidLat, centroidLng];
    } else if (type === "polyline") {
      let polygion = layer.getLatLngs();
      polygion.forEach((latlng) => {
        let temp = [latlng.lat, latlng.lng];
        test.push(temp);
      });

      htype = "line";

      if (polygion.length % 2 === 0) {
        // Even number of points
        let midIndex1 = polygion.length / 2 - 1;
        let midIndex2 = polygion.length / 2;

        let temp1 = (polygion[midIndex1].lat + polygion[midIndex2].lat) / 2;
        let temp2 = (polygion[midIndex1].lng + polygion[midIndex2].lng) / 2;

        center = [temp1, temp2];
      } else {
        // Odd number of points
        let midIndex = Math.floor(polygion.length / 2);

        center = [polygion[midIndex].lat, polygion[midIndex].lng];
      }
    } else if (type === "marker") {
      let point = layer.getLatLng();
      center = [point.lat, point.lng];
      test = [point.lat, point.lng];
      htype = "marker";
    }

    console.log(type);

    let z = { center, polygion: test, type: htype };
    let y = JSON.stringify(z);
    console.log(y);
    navigator.clipboard.writeText(y);
  });
}
