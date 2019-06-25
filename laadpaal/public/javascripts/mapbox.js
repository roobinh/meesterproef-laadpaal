(function() {
  // MapBox
  mapboxgl.accessToken =
    "pk.eyJ1Ijoicm9vYmluMTk5OSIsImEiOiJjanJxYzVpeGIwdzJ4NDlycTZvd2lramRkIn0.jEoxjM-oE38jYCIHnhLw_g";

  // variables for calculating nearest pole
  let complaints = [];
  let availablepoles = [];
  let dichstbijzijnde = [99999, 0, 0];
  let pointers = [];
  let flewToNearestPole = 0;

  const hrefArr = window.location.href.split("/");
  const href = hrefArr[hrefArr.length - 1];

  //create map
  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11?optimize=true",
    zoom: 12,
    center: [4.909203, 52.360157]
  });

  // set user location
  let geolocation = new this.mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });

  map.addControl(geolocation, "bottom-right");

  // disable map rotation using right click + drag
  map.dragRotate.disable();

  // disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation();

  // on mapload, trigger user location
  map.on("load", function() {
    geolocation._geolocateButton.click();
  });

  geolocation.on("geolocate", function(e) {
    calculateNearestPole(e.coords.longitude, e.coords.latitude);
  });

  let query = `
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
        let color, showComplaints;

        if (complaints.includes(pole._id)) {
          color = "yellow";
          showComplaints = 1;
        } else {
          if (pole.usedsockets == pole.sockets) {
            // both poles in use
            color = "red";
            showComplaints = 0;
          } else {
            // no complaint + open spot
            availablepoles.push([pole.longitude, pole.latitude]);
            color = "green";
            showComplaints = 0;
          }
        }

        if (href == "nearestpole") {
          if (color == "green") {
            let pointer = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [pole.longitude, pole.latitude]
              },
              properties: {
                address: pole.address,
                id: pole._id,
                lngLat: pole.longitude + " " + pole.latitude,
                color: color,
                showComplaints: showComplaints
              }
            };
            pointers.push(pointer);
          } else {
            //do nothing
          }
        } else {
          let pointer = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [pole.longitude, pole.latitude]
            },
            properties: {
              address: pole.address,
              id: pole._id,
              lngLat: pole.longitude + " " + pole.latitude,
              color: color,
              showComplaints: showComplaints
            }
          };
          pointers.push(pointer);
        }
      });

      map.addSource("earthquakes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          crs: {
            type: "name",
            properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
          },
          features: pointers
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "earthquakes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            100,
            "#f1f075",
            750,
            "#f28cb1"
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.on("mouseenter", "unclustered-point", function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "unclustered-point", function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "";
      });

      // inspect a cluster on click
      map.on("click", "clusters", function(e) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"]
        });
        const clusterId = features[0].properties.cluster_id;

        map
          .getSource("earthquakes")
          .getClusterExpansionZoom(clusterId, function(err, zoom) {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          });
      });

      map.on("click", "unclustered-point", function(e) {
        const address = e.features[0].properties.address;
        const id = e.features[0].properties.id;
        const lnglat = e.features[0].properties.lngLat.split(" ");
        let mapbutton;
        if (e.features[0].properties.showComplaints == 1) {
          mapbutton = "";
        } else {
          mapbutton = "grey";
        }
        let html = `
          <h3>${address}</h3>
          <p><a class="mapbutton" href="/setpole/${id}">Melding maken</a></p>
          <p><a class="mapbutton ${mapbutton}" href="/reports/${id}">Meldingen bekijken</a></p>
          <p><a class="mapbutton" href="https://maps.google.com/?q=${
            lnglat[1]
          },${lnglat[0]}">Navigeren</a></p>
        `;

        new mapboxgl.Popup()
          .setLngLat(e.features[0].properties.lngLat.split(" "))
          .setHTML(html)
          .addTo(map);
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "earthquakes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        }
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "earthquakes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-stroke-width": 4,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.5
        }
      });
    });

  document.querySelector("#fly").addEventListener("click", function() {
    flyToNearestPole();
  });

  if(href !==  "nearestpole") {
    const legendaButton = document.getElementById("legendaButton");

    legendaButton.addEventListener("click", function() {
      toggleLegenda();
    });
  }
  
  function calculateNearestPole(long, lat) {
    availablepoles.forEach(pole => {
      const distance = calculateDistance(lat, long, pole[1], pole[0]);

      if (distance < dichstbijzijnde[0]) {
        dichstbijzijnde = [distance, pole[1], pole[0]];
      }
    });
    if(dichstbijzijnde[0] !== 99999) {
      console.log("nearest pole calculated." + dichstbijzijnde)
      document.querySelector('#fly').setAttribute('style', 'background: #2F855A;')
      document.querySelector('#fly').disabled = false;
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1); // deg2rad below
    let dLon = deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function flyToNearestPole() {
    if (dichstbijzijnde[1] == 0 && dichstbijzijnde[2] == 0) {
      console.log("paal nog niet berekend.");
    } else {
      map.flyTo({
        center: [dichstbijzijnde[2], dichstbijzijnde[1]],
        zoom: 16
      });
    }
  }

  function toggleLegenda() {
    const legenda = document.querySelector(".legenda");
    legenda.classList.toggle("heightZero");
    if (legendaButton.innerHTML === "?") {
      legendaButton.innerHTML = "X";
    } else {
      legendaButton.innerHTML = "?";
    }
  }
})();
