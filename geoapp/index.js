var fs = require('fs');
var request = require('request');
var d3      = require('d3');
var topojson = require('topojson');

url = 'http://data.rio/dataset/pontos-dos-percursos-de-onibus';
var geojson = {};
geojson.features = [];
geojson.type = "FeatureCollection";

request(url, function(error, response, html){
   if (error) return console.warn(error);
    var rex = /http.*linha.*csv/g;
    var urls = html.match(rex);
    // console.log(urls.length);
    urls.filter(onlyUnique);

    urls.forEach( function (d,i,array) {       // para cada url de linha de bus
        request(d, function(error, response, csv){
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
              },
              "properties": {}
            };

            d3.csv.parse(csv, function(d){
                feature.geometry.coordinates.push([+d.longitude,+d.latitude]);
                if (!feature.properties.linha) {feature.properties.linha = d.linha};
                if (!feature.properties.descricao) {feature.properties.descricao = d.descricao};
            });

            geojson.features.push(feature);   
            
            if (i === array.length - 1) {
                salvar();
            }
        })
    });

});

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

var propriedades = function propertyTransform(feature) {
  return feature.properties;
}

function salvar(){
    // fs.writeFile('output.json', JSON.stringify(urls, null, 0), function(err){
    // var topo = topojson.topology({linhas: geojson}, {"property-transform": propriedades});
    var topo = topojson.topology({linhas: geojson}, {"property-transform": propriedades});

    fs.writeFile('output.json', JSON.stringify(topo, null, 0), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
    });
}

