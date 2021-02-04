// Store our API endpoint inside queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL to retrieve geoJSON data
d3.json(queryUrl, function(data) {
  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features)
});

// function to create features of each earthquake
function createFeatures(earthquakeData) {
  // function to add popup info about each earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + `Location: ${feature.properties.place}` + "</h3><hr><p>" +
     `<strong>Time</strong>: ${new Date(feature.properties.time)}` + "</p>" + "</h3><hr><p>" +
     `<strong>magnitude</strong>: ${feature.properties.mag}` + "</p>" + "</h3><hr><p>" +
     `<strong>Status</strong>: ${feature.properties.status}` + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let layerToMap = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // define marker circle radius and color based on earthquake magitude..
    pointToLayer: function pointToLayer(feature, latlng) {
      let radius = feature.properties.mag * 5.0;
      let magnitude = feature.properties.mag;

      if (magnitude > 5) {
        fillcolor = '#ea2c2c';
      }
      else if (magnitude > 4) {
        fillcolor = '#ea822c';
      }
      else if (magnitude > 3) {
        fillcolor = '#ee9c00';
      }
      else if (magnitude > 2) {
        fillcolor = '#eecc00';
      }
      else if (magnitude > 1) {
        fillcolor = '#d4ee00';
      }
      else  fillcolor = '#98ee00';

      return L.circleMarker(latlng, {
        radius: radius,
        color: 'black',
        fillColor: fillcolor,
        fillOpacity: 1,
        weight: 0.5
      });
    }
  });

  // create marker circles
  createMap(layerToMap);
}

// this is where we gonna build different tile layers maps
function createMap(earthquakes) {

  // Define outdoormap layers
  let outdoormap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  // Define darkmap layers
  let darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
  });

  // Define satellitemap layers
  let satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Adding our geoJSON data, along with style information, to the tectonicplates layer
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // Then add the tectonicplates layer to the map.
      tectonicplates.addTo(myMap);
  });

  // We create the layers for the tectonicplates
  let tectonicplates = new L.LayerGroup();

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Dark Map": darkmap,
    "satellite Map": satellitemap,
    "outdoor Map": outdoormap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes  
  };

  // Create our map, giving it the outdoormap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [darkmap, satellitemap, outdoormap]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // position legend on map bottim left corner
  let legend = L.control({position: "bottomright"});

  // Then add all the details for the legend
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [0, 1, 2, 3, 4, 5];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // name the legend
    div.innerHTML = 'Magnitude<br><hr>' 

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, we add our legend to the map.
  legend.addTo(myMap);
};






