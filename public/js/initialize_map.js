//Icons
var bikeIcon = L.AwesomeMarkers.icon({ icon: 'location-arrow', prefix:'fa', markerColor: 'orange'});
var buildingIcon = L.AwesomeMarkers.icon({ icon: 'building-o', prefix:'fa', markerColor: 'green'});
var hospitalIcon = L.AwesomeMarkers.icon({ icon: 'h-square', prefix:'fa', markerColor: 'red'});
var placeIcon = L.AwesomeMarkers.icon({ icon: 'camera', prefix:'fa', markerColor: 'blue'});
var startIcon = L.AwesomeMarkers.icon({ icon: 'play', prefix:'fa', markerColor: 'green'});
var endIcon = L.AwesomeMarkers.icon({ icon: 'stop', prefix:'fa', markerColor: 'red'});

//Core
var map;
var routes = [];
var route_layers = [];

//Overlays
var placesOfWorship = L.layerGroup();
var placesOfInterest = L.layerGroup();
var hospitals = L.layerGroup();
var bikingPlaces = L.layerGroup();

// Basemap Layers
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: ["otile1", "otile2", "otile3", "otile4"],
    attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
    maxZoom: 18,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
    attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
    maxZoom: 18,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
    attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

map = L.map("map", {
    zoom: 10,
    center: [40.702222, -73.979378],
    layers: [mapquestOSM]
});
// Hack to preserver layer order in Layer control
//map.removeLayer(subwayLines);

// Larger screens get expanded layer control
if (document.body.clientWidth <= 767) {
    var isCollapsed = true;
} else {
    var isCollapsed = false;
};

var baseLayers = {
    "Streets": mapquestOSM,
    "Imagery": mapquestOAM,
    "Hybrid": mapquestHYB
};

var overlays = {
    "Places of Worship": placesOfWorship,
    "Places of Interest": placesOfInterest,
    "Hospitals": hospitals,
    "Bike Rental & Parking": bikingPlaces
};

var layerControl = L.control.layers(baseLayers, overlays, {
    collapsed: isCollapsed
}).addTo(map);

placesOfWorship.addTo(map);
placesOfInterest.addTo(map);
hospitals.addTo(map);
bikingPlaces.addTo(map);

var sidebar = L.control.sidebar("sidebar", {
    closeButton: true,
    position: "left",
    autoPan: false
}).addTo(map);

// Placeholder hack for IE
if (navigator.appName == "Microsoft Internet Explorer") {
    $("input").each( function () {
        if ($(this).val() == "" && $(this).attr("placeholder") != "") {
            $(this).val($(this).attr("placeholder"));
            $(this).focus(function () {
                if ($(this).val() == $(this).attr("placeholder")) $(this).val("");
            });
            $(this).blur(function () {
                if ($(this).val() == "") $(this).val($(this).attr("placeholder"));
            });
        }
    });
}