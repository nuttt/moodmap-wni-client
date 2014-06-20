/**
 * Utility Class for converting point to GeoJSON
 * @constructor
 * @param {Object} this contains {lat, lon, title, mood, level, id}
 *        (mood: 5 - Very Happy, 1 - Very Sad) (level 2 - Country, 1 - City, 0 - Individual)
 */
function DataPoint(args) {
  this.lat = parseFloat(args.lat);
  this.lon = parseFloat(args.lon);
  this.title = args.title || args.name;
  this.mood = parseInt(args.mood);
  this.level = parseInt(args.level);
  this.id = args.id;
}

/**
 * Create GeoJSON Object of the marker
 * @return {Object} GeoJSON of the marker
 */
DataPoint.prototype.toGeoJson = function() {

  var geoJson = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [this.lon, this.lat]
    },
    "properties": {
      "id": this.id,
      "title": this.title,
      "mood": this.mood,
      "level": this.level,
      "icon": {
        "iconUrl": "img/pin-mood-" + this.mood + ".png",
        "iconSize": [50, 129], // size of the icon
        "iconAnchor": [25, 64], // point of the icon which will correspond to marker's location
        "popupAnchor": [0, -67], // point from which the popup should open relative to the iconAnchor
        "className": "marker"
      }
    }
  };

  return geoJson;
};