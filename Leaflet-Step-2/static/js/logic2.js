//create the tile layer that will be the background of our map
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
})

var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
})

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
})

// create the basemap objects
var baseMaps = {
	"Satellite": satellite,
	"Grayscale" : grayscale,
	"Outdoors" : outdoors
}

// Initialise the layergroups
var layers = {
	TECTONIC_LINE: new L.LayerGroup(),
	EARTHQUAKES: new L.LayerGroup()
  };

// Define a map object
var myMap = L.map("map", {center: [23.6978, 120.9605], 
zoom: 5,
layers:[layers.TECTONIC_LINE,	layers.EARTHQUAKES]
});

// Add satellite layer
satellite.addTo(myMap);

// Create an overlay object to add to the layer control
var overlayMaps = {

  "Earthquakes":layers.EARTHQUAKES,
  "Fault Lines": layers.TECTONIC_LINE
};

// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
	collapsed: false
  }).addTo(myMap);

//DATA SOURCE
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//load the data from the url
d3.json(tectonicUrl).then(function(data) {

	// Grab the tectonic data
	var mainFeatures = data.features;

	for (var i = 0; i < mainFeatures.length; i++) {

		//store the coordinates into a variable
		var coordinates = mainFeatures[i].geometry.coordinates;

		//declare this array to store the coordinates
		var mainCoordinates = [];

		mainCoordinates.push(coordinates.map(coordinate => [coordinate[1], coordinate[0]]));

		// Create tectonic lines
		var lines = L.polyline(mainCoordinates, {color: "rgb(255, 165, 0)"});
		
		// Add the new marker to the appropriate layer
		lines.addTo(layers.TECTONIC_LINE);
	};
});


// Return a specific colors based on the magnitude
function circleColor(d) {
	return d >= 5 ? "#DE3163":
			d >= 4 ? "#FF7F50":
			d >= 3 ? "#9FE2BF":
			d >= 2 ? "#CCCCFF" :
			d >= 1 ? "#FFBF00" :
			"#DFFF00"  	;
};

// Perform an API call to the earthquake data endpoint
d3.json(baseUrl).then(function(info) {
	
	// Grab the features earthquake data
	var earthquake = info.features;

	for (var i = 0; i < earthquake.length; i++) {
		
		//Define variable magnitudes and coordinates of the earthquakes
		var magnitudes = earthquake[i].properties.mag;
		var coordinates = earthquake[i].geometry.coordinates;

		// Add circles and bind PopUps to map
		var circleMarkers = L.circle([coordinates[1], coordinates[0]], {
								fillOpacity: 0.8,
								fillColor: circleColor(magnitudes),
								color: circleColor(magnitudes),
								stroke: false,
								radius: magnitudes * 17000
	});

		// Add the new marker to the appropriate layer
		circleMarkers.addTo(layers.EARTHQUAKES);

		// Bind a popup to the marker that will  display on click. This will be rendered as HTML
		circleMarkers.bindPopup("<h3>" + earthquake[i].properties.place +
										"</h3><hr><p>" + new Date(earthquake[i].properties.time) + 
										'<br>' + '[' + coordinates[1] + ', ' + coordinates[0] + ']' + "</p>");
	};
});

// Legend for the chart
var legend = L.control({position: 'bottomright'});
legend.onAdd = function () {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 1, 2, 3, 4, 5];

	// loop through our magnitude intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + circleColor(grades[i]) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}
	return div;
};
legend.addTo(myMap);
