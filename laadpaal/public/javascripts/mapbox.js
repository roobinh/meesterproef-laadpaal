(function() {
  // MapBox
  mapboxgl.accessToken =
    "pk.eyJ1Ijoicm9vYmluMTk5OSIsImEiOiJjanJxYzVpeGIwdzJ4NDlycTZvd2lramRkIn0.jEoxjM-oE38jYCIHnhLw_g";

  // variables for calculating nearest pole
  var complaints = [];
  var availablepoles = [];
  var dichstbijzijnde = [99999, 0, 0];

  //create map
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11?optimize=true",
    zoom: 15,
    center: [4.909203, 52.360157]
  });

  // set user location
  var geolocation = new this.mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });

  map.addControl(geolocation);

  // on mapload, trigger user location
  map.on("load", function() {
    geolocation._geolocateButton.click();
  });

  geolocation.on("geolocate", function(e) {
    calculateNearestPole(e.coords.longitude, e.coords.latitude);
  });

  var query = `
    query {
      complaints {
        pole {
          _id
        }
      }
    }`;

  fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(response => response.json())
    .then(data => {
      data.data.complaints.forEach(complaint => {
        complaints.push(complaint.pole._id);
      });
    });

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
    }`;

  fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(response => response.json())
    .then(data => {
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

        // create marker
        var el = document.createElement("div");

        // set point color
        if (complaints.includes(pole._id)) {
          // if pole has a complaint
          el.className = "marker yellow";
        } else {
          if (pole.usedsockets == pole.sockets) {
            // both poles in use
            el.className = "marker red";
          } else {
            // no complaint + open spot
            availablepoles.push([pole.longitude, pole.latitude]);
            el.className = "marker green";
          }
        }

        new mapboxgl.Marker(el)
          .setLngLat(pointer["features"][0]["geometry"]["coordinates"])
          .setPopup(
            new mapboxgl.Popup({ offset: 15 }).setHTML(` // add popups
                    <h3>${pole.address}</h3>
                    <p><a href="/setpole/${pole._id}">Klacht indienen</a></p>
                    <p><a href="/complaint/details/${pole._id}">Klachten bekijken</a></p>
                    `)
          )
          .addTo(map);
      });
    }
  );

  document.getElementById("fly").addEventListener("click", function() {
    map.flyTo({
      center: [dichstbijzijnde[2], dichstbijzijnde[1]],
      zoom: 16
    });
  });

  function calculateNearestPole(long, lat) {
    availablepoles.forEach(pole => {
      var distance = calculateDistance(lat, long, pole[1], pole[0]);

      if (distance < dichstbijzijnde[0]) {
        dichstbijzijnde = [distance, pole[1], pole[0]];
      }
    });

    console.log(`dichstbijzijnde pole(afstand:${dichstbijzijnde[0]}): ${dichstbijzijnde[1]}, ${dichstbijzijnde[2]}`);
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

})();
