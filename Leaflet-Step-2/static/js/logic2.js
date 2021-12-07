//define the tilelayer
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v11",
  accessToken: API_KEY
});

//Set the base layers
var baseMaps = {
	"Satellite Map" : satellite,
	"Light Map" : lightmap,
	"Outdoors" :outdoors
};

//Initialising all the layergroups that we are using
var layers = {
	earthquakes : new L.LayerGroup(),
	tectonic : new L.LayerGroup()
};

//Define the map object
var myMap = L.map("map", {
	center: [37.09, -75.71],
	zoom:5,
	layers : [
		layers.earthquakes,
		layers.tectonic
	]
});

//Add the satelite layer to the map
satellite.addTo(myMap);

//create the overlay object
var overlayMaps = {
	"Tectonic Plates" : layers.tectonic,
	"Earthquakes" : layers.earthquakes
};


//add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
	collapsed: false
}).addTo(myMap);


//url where the data comes from
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a call to the tectonic endpoint
d3.json(tectonicUrl).then(function(data){

//grab the reference data of features
var techfeature = data.features;
for (var i = 0; i < techfeature.length; i++){
	var techcoordinate = techfeature[i].geometry.coordinates;
	var coordinateinfo = [];

	coordinateinfo.push(
		techcoordinate.map(d => [d[1],d[0]])
	);

	//Create the tectonic lines

var lines = L.polyline(coordinateinfo, {color: "red"});

//add the lines to the appropriate layer
lines.addTo(layers.tectonic);


};

});

//define a function to return the color of the circles according to the earthquake magnitude
function circlecolor(d) {
return d >= 5 ? "#FF4933" :
d >= 4 ? "#FF7733" :
d >= 3 ? "#FF9933" :
d >= 2 ? "#FFC733" :
d >= 1 ? "#F3FF33" :
"#E5E8E8";
};

//load the data from another URL
d3.json(earthquakeUrl).then(function(general){
	//grab the reference to the earthquake data
	var earthquakedata = general.features;

	for (var i = 0; i<earthquakedata.length; i++){
		var mag = earthquakedata[i].properties.mag;
		var coordinates = earthquakedata[i].geometry.coordinates;

		//add circles and bind Popups to map

var circlemarker = L.circle([coordinates[1],coordinates[0]],{
			fillOpacity : 0.8,
			fillColor : circlecolor(mag),
			color: circlecolor(mag),
			stroke: false,
			radius:mag *18000
		});

	//Add the new marker to the layer
	circlemarker.addTo(layers.earthquakes);	

	//bind a popup to the marker that will display on click. 
	circlemarker.bindPopup("<h3>"+earthquakedata[i].properties.place+ "</h3><hr><p>" 
	+ new Date (earthquakedata[i].properties.time) + "<br>" + "[ "+coordinates[1]+" , "+ coordinates[0] +" ]" + "</p>");
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
			'<i style="background:' + circlecolor(grades[i]) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}
	return div;
};
legend.addTo(myMap);
