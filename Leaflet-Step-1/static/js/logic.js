// Create map object
var myMap = L.map("map", {
	center: [37.09, -75.71],
	zoom:5
});
  
// Adding light mode tile layer to the map
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
}).addTo(myMap);

// Store our API endpoint inside queryUrl
var baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Read the data using d3
d3.json(baseUrl).then(function(data) {

// Return a specific colors based on the magnitude
function circleColor(d) {
	return d >= 5 ? "#FF4933" :
	d >= 4 ? "#FF7733" :
	d >= 3 ? "#FF9933" :
	d >= 2 ? "#FFC733" :
	d >= 1 ? "#F3FF33" :
	"#E5E8E8";;
};

	// Grab the features data
	var features = data.features;

	for (var i = 0; i < features.length; i++) {
		
		//Define variable magnitudes and coordinates of the earthquakes
		var magnitudes = features[i].properties.mag;
		var coordinates = features[i].geometry.coordinates;

		// Add circles to map
		L.circle(
			[coordinates[1], coordinates[0]], {
				fillOpacity: 0.8,
				fillColor: circleColor(magnitudes),
				color: "black",
				weight: 0.5,
				radius: magnitudes * 20000
			}).bindPopup("<h3>" + features[i].properties.place +
				"</h3><hr><p>" + new Date(features[i].properties.time) + 
				'<br>' + '[' + coordinates[1] + ', ' + coordinates[0] + ']' + "</p>").addTo(myMap);
	};	

	// Legend for the chart
	var legend = L.control({position: 'bottomright'});
	legend.onAdd=function (data) {
	
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 1, 2, 3, 4, 5],
			labels = [];

		// loop through our magnitude intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + circleColor(grades[i]) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		}
		return div;
	};
	legend.addTo(myMap);
});