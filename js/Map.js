/**
 * Create mapbox map and bind to html
 * @constructor
 * @param {string} mapId      id of the dom which map will be rendered
 * @param {string} mapboxRef  map id from Mapbox
 * @param {Object} mapOptions map option according to Mapbox Javascript API
 */
function Map(mapId, mapboxRef, mapOptions){
  this.map = L.mapbox.map(mapId, mapboxRef, mapOptions);

  this.markerLayer = L.mapbox.featureLayer().addTo(this.map);

  this.markerLayer.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;

    marker.setIcon(L.icon(feature.properties.icon));
  });
}

/**
 * Set zoom listener for map
 * @param {function} zoomDelegate function that handle zoom event (param: Mapbox Event Object)
 */
Map.prototype.setZoomListener = function(zoomDelegate){
  this.map.on('zoomend', zoomDelegate);
}

/**
 * Set listener when marker on maps was clikced
 * @param {function} markerOnClickDelegate function that handle click event (param: Mapbox Event Object)
 */
Map.prototype.setMarkerOnClickListener = function(markerOnClickDelegate){
  this.markerLayer.on('click', markerOnClickDelegate);
}

/**
 * Return level of data based on level of current zoom
 * @return {number} level of data (2=country, 1=city, 0=individual)
 */
Map.prototype.preferredDataLevel = function() {
    var dataLevel = 0;
    var zoomLevel = this.map.getZoom();

    if(zoomLevel < 6) {
        dataLevel = 2;      // Country Level
    } else if(zoomLevel < 12) {
        dataLevel = 1;      // City Level
    } else {
        dataLevel = 0;      // Individual Level
    }

    console.log(zoomLevel + "->" +dataLevel);
    return dataLevel;
}

/**
 * Render dataPoints on to map
 * @param {array} dataPoints Array of dataPoints
 */
Map.prototype.setMarkers = function(dataPoints) {
  var geoJsons = _.map(dataPoints, function(dataPoint){
                    return dataPoint.toGeoJson();
                });

  this.markerLayer.clearLayers();

  this.markerLayer.setGeoJSON(geoJsons);
}