// MapBox
mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9vYmluMTk5OSIsImEiOiJjanJxYzVpeGIwdzJ4NDlycTZvd2lramRkIn0.jEoxjM-oE38jYCIHnhLw_g";

// hva location
var mapLong = "4.909203";
var mapLat = "52.360157";
var complaints = [];

//create map
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11?optimize=true",
  zoom: 15,
  center: [mapLong, mapLat]
});

// set user location
map.addControl(
  new this.mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
);


var query =  `
query {
  complaints {
    pole {
      _id
    }
  }
}
`;

fetch("/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query })
})
  .then(response => response.json())
  .then(data => {
    data.data.complaints.forEach(complaint => {
      complaints.push(complaint.pole._id)
    })
  })

query = ` 
query {
  poles {
    _id
    longitude
    latitude
    city
    region
    regioncode
    district
    subdistrict
    address
    postalcode
    provider
    sockets
    usedsockets
  }
} `;

fetch("/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query })
})
  .then(response => response.json())
  .then(data => {

    console.log(data);

    data.data.poles.forEach(pole => {

      var pointer = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [pole.longitude, pole.latitude]
            },
            properties: {
              title: pole.address
            }
          }
        ]
      };

      var title = pole.address;
      var id = pole._id;

      var el = document.createElement("div");

      // set point color
      if(complaints.includes(id)) { // if pole has a complaint
        el.className = "marker yellow"; 
      } else {
        if(pole.usedsockets == pole.sockets) { // both poles in use
          el.className = "marker red";  
        } else { // no complaint + open spot
          el.className = "marker green"
        }
      }

      new mapboxgl.Marker(el)
          .setLngLat(pointer['features'][0]['geometry']['coordinates'])
          .setPopup(new mapboxgl.Popup({ offset: 15 }) // add popups
          .setHTML(`
                    <h3>${title}</h3>
                    <p><a href="/setpole/${id}">Klacht indienen</a></p>
                    <p><a href="/complaint/details/${id}">Klachten bekijken</a></p>
                    `))
          .addTo(map);
    });
  });
