var request = require('request');

query = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> \
PREFIX fn: <http://www.w3.org/2005/xpath-functions#> \
PREFIX owl: <http://www.w3.org/2002/07/owl#> \
PREFIX par: <http://parliament.semwebcentral.org/parliament#> \
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
PREFIX time: <http://www.w3.org/2006/time#> \
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
\
\
SELECT DISTINCT \
?class \
WHERE { \
   ?class a owl:Class . \
   FILTER (!isblank(?class)) \
}";

request({ 
	uri: "http://localhost:8080/parliament/sparql",
	method: "POST",
	form: { 
		query:query,
		display:"json",
		output:"json" 
	}	
}, 
function(error, response, body) {
  	console.log(error);
  	console.log(body);
});