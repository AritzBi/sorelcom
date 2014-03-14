

//functions
//Route handling
var toogleClickMode;
var loadRoute;
var addRoute;
var showRoute;
var aroundRoute;
var loadRouteList;

//Account thingies
var login;
var logout;
var register;

//Set to unload a button
toggleClickMode = function(key){
    var link = $('a.route#'+key).addClass('active');
    link.off('click');
    $('a.route#'+key).on('click', function(){
        $(this).removeClass('active');
        $(this).off('click');
        $(this).on('click', function(){
            showRoute($(this).attr('id'), undefined);
        });
        map.removeLayer(route_layers[$(this).attr('id')]);
    });
};

//Load the coordinate data to Leaflet from a Json
loadRoute = function(data){
    coords = data.coordinates[0];
    var latlngs = [];
    for(var i = 0, len = coords.length; i < len; i++){
        latlngs.push(new L.LatLng(coords[i][1], coords[i][0]));
    }
    
    var poly = new L.polyline(latlngs, { opacity: 0.8});
    return poly;    
};

//Add a new route to the map
addRoute = function(data, key){
    console.log(data)
    //var poly = loadRoute(data.features[0]);
    //var latlngs = poly.getLatLngs();
    var layers = L.geoJson(data,{
        //pointToLayer: function(feature, latlng){
        //    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({ icon: feature.properties.icon, prefix:'fa', markerColor: feature.properties.color})});
        //},
        style: function (feature) {
            return {color:"green"}
    }
    });
    layers.addTo(map);
    
    //routes[key] = poly;
    route_layers[key] = layers;
    toggleClickMode(key);

    map.fitBounds(layers.getBounds());
}

//Load a route, if it is not added it add it
showRoute = function(key, geom){
    if(routes[key] != undefined){
        map.addLayer(route_layers[key]);
        toggleClickMode(key);
    } else {
        if(geom == undefined){
            $.getJSON("/api/route.json?id="+key, function(data){
                addRoute(data, key);
            });
        } else {
            addRoute(geom, key);
        }
        $.getJSON("/api/around_route.json?id="+key, aroundRoute);
    }
}


aroundRoute = function(data){
    for(var i = 0, len = data.length; i < len; i++){
            
        if(data[i][3] == "bicycle_parking"){
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: bikeIcon});
            bikingPlaces.addLayer(marker);
            marker.bindPopup("<b>Bike Parking</b><p>"+data[i][2]+"</p>");

        } else if(data[i][3] == "place_of_worship") {
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: buildingIcon});
            placesOfWorship.addLayer(marker);
            var string;
            if(data[i][4].building != undefined)
                string = "<b>"+data[i][4].building+"</b>"
            else
                string = "<b>Place of worship</b>"
            if(data[i][4].religion != undefined)
                string += "<p>religion: " + data[i][4].religion + "</p>"
            string += "<p>"+data[i][2]+"</p>"
            marker.bindPopup(string);

        } else if(data[i][3] == "bicycle_rental") {
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: bikeIcon});
            bikingPlaces.addLayer(marker);
            marker.bindPopup("<b>Bike rental</b><p>"+data[i][2]+"</p>");

        } else if(data[i][3] == "hospital") {
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: hospitalIcon});
            hospitals.addLayer(marker);
            marker.bindPopup("<b>Hospital</b><p>"+data[i][2]+"</p>");

        } else if(data[i][3] == "fountain"){
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: placeIcon});
            placesOfInterest.addLayer(marker);
            marker.bindPopup("<b>Fountain</b><p>"+data[i][2]+"</p>");    

        } else if(data[i][3] == "theatre"){
            var marker = L.marker(new L.LatLng(data[i][0], data[i][1]), {icon: buildingIcon});
            placesOfInterest.addLayer(marker);
            marker.bindPopup("<b>Threatre</b><p>"+data[i][2]+"</p>");    
        }
    }
    map.fitBounds( map.getBounds() );
}



loadRouteList = function(){
    $.getJSON("/api/user_route_list", function(data){
        var routeList = $('#route-list');
        routeList.empty();
        for(var i = 0, len = data.length; i < len; i++){
            var a = $(document.createElement('a'));
            var span = $(document.createElement('span'));
            a.attr('class','list-group-item route');
            a.attr('id',data[i].id);
            a.attr('href','#');
            a.text(data[i].name);
            span.attr('class','badge');
            span.text(data[i].difficulty);
            a.append(span);
            routeList.append(a);
            a.click(function(){
                showRoute($(this).attr('id'), undefined);
            });
        }
    });
}

login = function(event){
    $.post('/ajax/login', $('#login-form').serialize(), function(data){  
        if(data.success == true){
            loadRouteList();
            $('#log-button').html('<a href="#" id="logout-button"><i class="fa fa-user"></i>&nbsp;&nbsp;Logout</a>');
            $('#upload-button').attr('href','#uploadModal');
            $('#logout-button').click(logout);
            $('#loginModal').modal('hide');
        } else {
            $('#login-error').text(data.result);
        }
    }, "json");
    $('#login-form')[0].reset();
};

logout = function(event){
    $.post("/ajax/logout", function(data){
        if(data.success == true){
            $('#log-button').html('<a href="#loginModal" data-toggle="modal"><i class="fa fa-user"></i>&nbsp;&nbsp;Login</a>');
            $('#upload-button').attr('href','#loginModal');
            loadRouteList();
        } else {
            //Print logout error msg
        }
    });
};

register= function(event){
    $.post('/ajax/register', $('#signup-form').serialize(), function(data){
        if(data.success){
            $('#signupModal').modal('hide');
            $('#loginModal').modal('show');   
        }
    });
};

showGeoJSON = function(geojson){
        var layer = L.geoJson(geojson);
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
};


upload = function(event){
    var reader = new FileReader();
    var extension = $("#id-route-file").val().split('.').pop();

    reader.onload = function(e) {
        var geojson;
        if($.inArray(extension, ['gpx','GPX']) > -1)
            geojson = toGeoJSON.gpx($.parseXML(reader.result));
        else if($.inArray(extension, ['kml','KML']) > -1)
            geojson = toGeoJSON.kml($.parseXML(reader.result));
        else if($.inArray(extension, ['json','JSON','geojson','GEOJSON']) > -1)
            geojson = JSON.parse(reader.result);
        else
            return $('#upload-error').text('File format not supported'); 

        geojson['properties'] = {};
        geojson['properties']['name'] = $("#id-upload-name").val();
        geojson['properties']['id'] = geojson['properties']['name'].replace(/\s/g,'_');

        $.post('/ajax/insertRoute', { 
            route: geojson
        }, function(data){
            if(!data.success)
                $("#upload-error").text(data.result);
            else {
                showGeoJSON(geojson);
                $('#uploadModal').modal('hide');
            }
        }, "json");
    };
    
    reader.readAsText($("#id-route-file").get()[0].files[0]);
};

// Highlight search box text on click
$("#searchbox").click(function () {
    $(this).select();
});

// Get current location at start
navigator.geolocation.getCurrentPosition(function(position){
    var location = new L.LatLng(position.coords.latitude, position.coords.longitude); 
    L.marker(location, {icon: new L.AwesomeMarkers.icon({ icon: 'location-arrow',  color: 'green'})}).addTo(map);
    map.setView(location, 13);
});

//
//
//Event Handler code
//
//
$('#logout-button').click(logout);
$('#login-button').click(login);
$('#signup-button').click(register);
$('#upload-btn').click(upload);

$('#loginModal').on('hidden.bs.modal', function () {
    $('#login-error').empty();
});

$('#signupModal').on('hidden.bs.modal', function () {
    $('#signup-error').empty();
});

$('#uploadModal').on('hidden.bs.modal', function () {
    $('#upload-error').empty();
});

$('a.route').on('click.load',function(){
    showRoute($(this).attr('id'), undefined);
});


loadRouteList();
$("#loading").hide();

$(document).ajaxStart(function(){
    $('#loading').show();
});
$(document).ajaxStop(function () {
    $('#loading').hide();
});

