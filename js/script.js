/*global L, $, console, google*/

var map = L.mapbox.map('map', 'nuttt.ifb5eich');
var markerLayer = L.mapbox.featureLayer().addTo(map);

var positionCache = {};
var hadRunPrefetch = false;

var currentGroup;

markerLayer.on('layeradd', function (e) {
  var marker = e.layer,
    feature = marker.feature;

  marker.setIcon(L.icon(feature.properties.icon));
  marker.on('click', setPane);
});

  
function setPane(markerData){
  d = markerData.target.toGeoJSON();
  key = d.properties.title;
  mood = currentGroup[key]["mood"];
  data = currentGroup[key]["data"][0];
  // console.log('SetPane Data -----------------------------');
  // console.log(data);
  // console.log(data.location);
  getCityData(data.location);
  
  sortedMood = mood.sort(function(a,b) { return parseFloat(b.percentage) - parseFloat(a.percentage) } );
  
  console.log(sortedMood);
  console.log(mood);
  console.log(data);
  
  openPane();
}

var dataCollection = {};
var markerCollection = {};


// Main Function
function mainFunction(){

  console.log("start");
  getAndUpdateData(function(){
    drawMarkerByArea();
  });

}

mainFunction();

function getAndUpdateData(callback) {
  getData(function(response, err){
    if(!err) {
      updateData(response, callback);     
    }
  });
}


function updateData(newDataResponse, callback) {
  
  var newDataCollection = {};
  var newId = [];
  
  // newDataResponse = newDataResponse.slice(0,20);
  
  newDataResponse.forEach(function(newData){
    var id = newData.repoid;
    
    if(dataCollection[id]) {
      newDataCollection[id] = dataCollection[id];
    } else if(newData.location && newData.lat != 0 && newData.lon != 0){
      newDataCollection[id] = newData;
      newId.push(id);
    }
    
  });
  
  dataCollection = newDataCollection;
  
  console.log(dataCollection);
  console.log(newId);
  
  var seriesUpdatePinAddress = [];
  
  async.eachSeries(newId, function(id, callback){
    updatePinAddress(id, callback);
  }, function(){

    for(id in dataCollection) {
      if(!dataCollection[id].address) {
        console.log("filter out " + id);
        delete dataCollection[id];
      }
    }
    
    if(!hadRunPrefetch){
      preCachePosition(function(){
        hadRunPrefetch = true;
        callback();
      });
    } else {
      callback();
    }
    
  });
}

function addMarker(newId) {
  
  var markerArray = [];
  // remove old marker
  
  // add new marker
  newId.forEach(function(id) {
    if(dataCollection[id].address){ 
      var geoJson = createDataGeoJson(id);
      markerCollection[id] = geoJson;
      markerArray.push(geoJson);
    }
  });
  
  markerLayer.setGeoJSON(markerArray);
}


function drawMarkerByCountry() {
  drawMarkerByGroup(function(data){
    return data.address.country || null;
  });
}

function drawMarkerByArea() {
  drawMarkerByGroup(function(data){
    return data.address.area || null;
  });
}

function calculateMood(dataArray) {
  var num = countMood(dataArray);
  console.log("moodnum: " + num);
  var sum = _.reduce(num, function(memo, i) { return memo + i; });
  var result = _.map(num, function(i, key){ return {
    level: key,
    percentage: i * 100.0 / sum
  } });
  
  return _.sortBy(result, function(i){ return i.percentage; });
}

function countMood(dataArray) {
  var num = [0,0,0,0,0,0];
  dataArray.forEach(function(d){
    if(d.skyfeel){
      num[parseInt(d.skyfeel)]++;
    }
  });
  return num;
}

function drawMarkerByGroup(keyFunction) {
  
  var group = {}
  var keys = [];
  
  for(var id in dataCollection) {
    var d = dataCollection[id];
    var key = keyFunction(d);
    if(!group[key]) {
      group[key] = {};
      group[key]["data"] = [];
      keys.push(key);
    }
    group[key]["data"].push(d);
  }
  
  for(key in group) {
    group[key]["mood"] = calculateMood(group[key]["data"]);
  }
  
  currentGroup = group;
  
  async.eachSeries(keys, function(key, callback){
    CachePosition(key, callback);
  }, function(){
    
    var geoJSONs = [];
    
    for(key in group) {
      var p = positionCache[key];
      var mood = group[key].mood;
      geoJSONs.push(createGeoJson(key, key, p.lat, p.lon, mood[mood.length - 1].level));
    }
    
    markerLayer.setGeoJSON(geoJSONs);
    
  });
}

function preCachePosition(callback){
  
  console.log("precaching...");
  
  str = [];
  str.concat(_.map(dataCollection, function(d, id){return d.address.country;}));
  str.concat(_.map(dataCollection, function(d, id){return d.address.area;}));

  console.log("str: "+ str  );
  
  async.eachSeries(str, function(s, async_callback){
    console.log("caching "+s);
    CachePosition(s, async_callback);
  }, callback);
  
}


function CachePosition(str, callback) {
  if(!positionCache[str]) { 
    geocode(str, function(result, error){
      console.log(result);
      positionCache[str] = {lat: result[0]["lat"], lon: result[0]["lon"]};
      callback();
    });
  }
}

function createDataGeoJson(id) {
  var data = dataCollection[id];
  
  var geoJson = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [parseFloat(data.lon), parseFloat(data.lat)]
    },
    "properties": {
      "title": data.address.country,
      "icon": {
        "iconUrl": "img/pin-mood-1.png",
        "iconSize": [50, 129], // size of the icon
        "iconAnchor": [25, 64], // point of the icon which will correspond to marker's location
        "popupAnchor": [0, -67], // point from which the popup should open relative to the iconAnchor
        "className": "pin"
      }
    }
  };
  
  return geoJson;
}

function createGeoJson(id, title, lat, lon, moodLevel) {
  var geoJson = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [parseFloat(lon), parseFloat(lat)]
    },
    "properties": {
      "title": title,
      "id": id,
      "icon": {
        "iconUrl": getMoodLevelImageUrl(moodLevel),
        "iconSize": [50, 129], // size of the icon
        "iconAnchor": [25, 64], // point of the icon which will correspond to marker's location
        "popupAnchor": [0, -67], // point from which the popup should open relative to the iconAnchor
        "className": "pin"
      }
    }
  };
  
  return geoJson;
}

function getMoodLevelImageUrl(moodLevel) {
  return "img/pin-mood-" + moodLevel + ".png";
}

function getData(callback) {
  $.ajax({
    url: "http://gsp.weathernews.jp/grpt6aa/gsp/tools/get_report_list.cgi",
    jsonp: "callback",
    dataType: "jsonp",
    success: function(response) {
      callback(response, null);
    },
    error: function(jqXHR, textStatus) {
      console.error(textStatus);
      callback(null, textStatus);
    }
  });
}

function updatePinAddress(id, callback) {
  
  item  = dataCollection[id];
  
  getCityAndCountryFromPosition(item.lat, item.lon, function(result){
    // item.address = result;
    console.log(result);
    country = result.country;
    subarea = result.state_district || result.state || result.city;
    
    if( country && subarea ) {
      item.address = {country: country, subarea: subarea, area: subarea + ", " + country};
      console.log({country: country, subarea: subarea});
    } else {
      item.address = null;
    }
    
    callback();
  });
}

function getCityAndCountryFromPosition(lat, lng, callback) {
  reverseGeocode(lat, lng, function(results, error){
    
//    if(results && results[results.length - 2]) {
//      
//      console.log(results);
//      var addr = results[results.length - 2];
//      console.log(addr);
//      
//      callback({
//        formatted_address: addr.formatted_address,
//        city: addr.address_components[0],
//        country: addr.address_components[1]
//      });
//    } else {
//      callback(null);
//    }
    
    if(results) {
      
      console.log(results.address);
      callback(results.address);
      
    } else {
      console.log(error);
      callback(null);
    }
    
  });
}

function _reverseGeocode(lat, lng, callback, timeout) {

  
  var latlng = new google.maps.LatLng(lat, lng);

  if(!timeout) {
    timeout = 1024;
  }
//  var callback_param = null;
  
  geocoder.geocode({'latLng': latlng}, function (results, status) {
    
    console.log(status);
    
    if (status === google.maps.GeocoderStatus.OK) {
      callback(results);
    } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
      console.log("Waiting " + timeout);
      setTimeout(function(){_reverseGeocode(lat, lng, callback, timeout*2);}, timeout);
    } else {
      console.log("Wrong data");
      console.log(lat + " " + lng);
      callback(null);
    }
  });
}

function urlForReverseGeocode (lat, lng) {
  return "http://nominatim.openstreetmap.org/reverse?lat=" + lat +"&lon=" + lng + "&accept-language=en-us&format=json&zoom=18";
}

function urlForGeocode (str) {
  return "http://nominatim.openstreetmap.org/search?q="+ str +"&format=json&accept-language=en-us&limit=1"
}

function geocode(str, callback) {
  $.ajax({
    url: urlForGeocode(str),
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      callback(response, null);
    },
    error: function(jqXHR, textStatus) {
      console.error(textStatus);
      callback(null, textStatus);
    }
  });
}

function reverseGeocode(lat, lng, callback) {
  $.ajax({
    url: urlForReverseGeocode(lat, lng),
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      callback(response, null);
    },
    error: function(jqXHR, textStatus) {
      console.error(textStatus);
      callback(null, textStatus);
    }
  });
}


function openPane() {
  $("#info-wrapper").addClass("open-pane");
}

function closePane() {
  $("#info-wrapper").removeClass("open-pane");
}


// for debug
var debug = false;

if (debug) {
  openPane();
  
  map.addEventListener('click', function (e) {
//    var r = reverseGeocode(e.latlng.lat, e.latlng.lng, function(r){
//      console.log(r);
//    });
  });
  
  // var myLayer = L.mapbox.featureLayer().addTo(map);
  
  var geoJson = [{
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [121.025390625, 23.765236889758672 ]
    },
    "properties": {
      "title": "Small astronaut",
      "icon": {
        "iconUrl": "img/pin-mood-1.png",
        "iconSize": [50, 129], // size of the icon
        "iconAnchor": [25, 64], // point of the icon which will correspond to marker's location
        "popupAnchor": [0, -67], // point from which the popup should open relative to the iconAnchor
        "className": "dot"
      }
    }
  }];
  
  // Set a custom icon on each marker based on feature properties.
//  markerLayer.on('layeradd', function (e) {
//    var marker = e.layer,
//      feature = marker.feature;
//
//    marker.setIcon(L.icon(feature.properties.icon));
//  });

  // Add features to the map.
  markerLayer.setGeoJSON(geoJson);
  
  
  // Google Maps Geocoder
  
  var geocoder = new google.maps.Geocoder();
  
}


