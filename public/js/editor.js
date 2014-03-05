var editing;
var maxMarkers = 100;

var load = function(data){
	editing = L.Polyline.PolylineEditor(data.coordinates, {maxMarkers: maxMarkers}).addTo(map);
}

var save = function(){
	var points = editing.getPoints();
	console.log(points);
}