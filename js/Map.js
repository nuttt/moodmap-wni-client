function Map(mapId, mapboxRef, mapOptions){
  this.map = L.mapbox.map(mapId, mapboxRef, mapOptions);

  this.markerLayer = L.mapbox.featureLayer().addTo(this.map);

  this.markerLayer.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;

    marker.setIcon(L.icon(feature.properties.icon));
  });
}

Map.prototype.setZoomListener = function(zoomDelegate){
  this.map.on('zoomend', zoomDelegate);
}

Map.prototype.setMarkerOnClickListener = function(markerOnClickDelegate){
  this.markerLayer.on('click', markerOnClickDelegate);
}

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

Map.prototype.setMarkers = function(dataPoints) {
  var geoJsons = _.map(dataPoints, function(dataPoint){
                    return dataPoint.toGeoJson();
                });

  this.markerLayer.clearLayers();

  this.markerLayer.setGeoJSON(geoJsons);
}