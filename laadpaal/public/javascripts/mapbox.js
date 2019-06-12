
// MapBox
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9vYmluMTk5OSIsImEiOiJjanJxYzVpeGIwdzJ4NDlycTZvd2lramRkIn0.jEoxjM-oE38jYCIHnhLw_g';

var mapLong = '4.9006';
var mapLat = '52.3648';

var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    zoom: 12,
    center: [mapLong, mapLat]
});

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
        var el = document.createElement('div')
        el.className = 'marker';
        console.log('placing marker...')

        new mapboxgl.Marker(el)
            .setLngLat(pointer['features'][0]['geometry']['coordinates'])
            .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h3>' + title + '</h3>' + "<p><a href='http://maps.google.com/?q=" + title + "'> Route </a></p>"))
            .addTo(map);
    }
}
