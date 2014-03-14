var request = require('request'),
	util = require('util');

var prefixes = "\
PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#>\n \
PREFIX fn: <http://www.w3.org/2005/xpath-functions#>\n \
PREFIX owl: <http://www.w3.org/2002/07/owl#>\n \
PREFIX par: <http://parliament.semwebcentral.org/parliament#>\n \
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n \
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n \
PREFIX time: <http://www.w3.org/2006/time#>\n \
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n \
PREFIX sorelcom: <http://morelab.deusto.es/ontologies/sorelcom#>\n \
PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n";



exports.routeList = function(req, res){
	var selectQuery = prefixes + util.format("SELECT ?id ?name \
		WHERE { \
   			?id rdfs:type sorelcom:Route . \
   			?id sorelcom:hasLabel ?name . \
		}");

	request({ 
		uri: "http://localhost:8080/parliament/sparql",
		method: "POST",
		form: { 
			query:query,
			display:"json",
			output:"json" 
			},
		json: true
		}, 
		function(error, response, body) {
  			console.log(error);
  			console.log(body);
		}
	);
};

exports.update = function(req, res, route){

};

exports.insertRoute = function(req, res){
	if(!req.session.user)
		return res.json({'success':false, 'result':'User not logged'});

	existsRoute(req.body.route.properties.id, function(err, exists){
		if(err)
			return res.json({'success':false, 'result':err});
		if(exists)
			return res.json({'success':false, 'result':"A route with that name already exists"});

		var route = req.body.route;
		var properties = route.properties;
		var ID = "sorelcom:" + properties.id;

		var insertQuery = prefixes + "INSERT DATA{\n";
		insertQuery += ID + " rdf:type sorelcom:Route .\n";
		insertQuery += ID + ' rdfs:label "' + properties.name + '" .\n';
		insertQuery += ID + ' sorelcom:hasAuthor sorelcom:' + req.session.user + ' .\n';
		
		if(route.type == "FeatureCollection")
			insertQuery += parseFeatureCollection(ID ,route);
		else if(route.type == "Feature") 
			insertQuery += parseFeature(ID, route);
		else 
			insertQuery += parseGeom(ID, route);
		
		insertQuery += "}";

		request({ 
			uri: "http://localhost:8080/parliament/sparql",
			method: "POST",
			form: { 
				update:insertQuery,
				display:"json",
				output:"json" 
				},
			json: true	
			}, 
			function(error, response, body) {
  				//console.log(error);
  				//console.log(body);
  				res.json({success:true, result:req.body});
			}
		);
	});
};


var existsRoute = function(id, callback){
	var selectQuery = prefixes + util.format("ASK { \
   		sorelcom:%s rdf:type sorelcom:Route . \
	}", id);
	request({ 
		uri: "http://localhost:8080/parliament/sparql",
		method: "POST",
		form: { 
			query:selectQuery,
			display:"json",
			output:"json" 
			},	
		json: true
		}, 
		function(err, res, body) {
			if(err)
				callback(err, null);
			if(res.statusCode != 200)
				callback("Database responded with status code " + res.statusCode, null)

			callback(null, body.boolean);
		}
	);
}

// Functions

var parseFeatureCollection = function(ID, featureCollection){
		var insertString = "";
		var features = featureCollection.features;

		for(var i = 0, len = features.length; i < len; i++){
			var geomID = ID + "_geom" + i;
			insertString += parseFeature(geomID, features[i]);
			insertString += ID + " geo:hasGeometry " + geomID;			
		}
		return insertString;
}

var parseFeature = function(ID, feature){
	return parseGeom(ID, feature.geometry)
}

var parseGeom = function(ID, geometry){
	insertString = ID + " rdf:type geo:Geometry .\n";
	insertString += ID + " geo:asWKT " + '"http://def.seegrid.csiro.au/sissvoc/ogc-def/resource?uri=http://www.opengis.net/def/crs/OGC/1.3/CRS84 ' + toWKT(geometry) + '"^^geo:wktLiteral .\n'; 	
	return insertString;
}

var toWKT = function(geom){
	var wkt = geom.type + "(";
	for(var j = 0, l = geom.coordinates[0].length; j < l; j++)
		wkt += " " + geom.coordinates[0][j];
	
	for(var i = 1, len = geom.coordinates.length; i < len; i++){
		wkt += ",";
		for(var j = 0, l = geom.coordinates[i].length; j < l; j++)
			wkt += " " + geom.coordinates[i][j];
	}
	wkt += ")";
	return wkt;
}