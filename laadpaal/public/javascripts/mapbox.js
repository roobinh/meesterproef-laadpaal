
// MapBox
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9vYmluMTk5OSIsImEiOiJjanJxYzVpeGIwdzJ4NDlycTZvd2lramRkIn0.jEoxjM-oE38jYCIHnhLw_g';
 
// hva location
var mapLong = '4.909203';
var mapLat = '52.360157';

//create map
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    zoom: 15,
    center: [mapLong, mapLat]
});

// set user location
map.addControl(new this.mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}))

var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            var json = JSON.parse(xmlhttp.responseText);
            setPointers(json);
        }
    };

xmlhttp.open("GET","./mapbox/poles.json",true);
xmlhttp.send();

function setPointers(poles) {
    for(i=0;i < poles.length;i++) {
        
        var pointer = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [poles[i].longitude, poles[i].latitude]
              },
              properties: {
                title: poles[i].name,
              }
            }]
        };

        var title = poles[i].name;
        var id = poles[i].id;

        var el = document.createElement('div')
        el.className = 'marker';

        new mapboxgl.Marker(el)
            .setLngLat(pointer['features'][0]['geometry']['coordinates'])
            .setPopup(new mapboxgl.Popup({ offset: 15 }) // add popups
            .setHTML(`
                      <h3>${title}</h3>
                      <p><a href="/setpole/${id}">Klacht indienen</a></p>
                      <p><a href="/complaint/details/${id}">Klachten bekijken</a></p>
                      `))

            .addTo(map);
    }
}
