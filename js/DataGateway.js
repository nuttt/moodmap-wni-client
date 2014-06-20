/**
 * Utility Class of getting Marker data. URL for each type of request need to be set before using request.
 * @constructor
 */
function DataGateway(){}


/**
 * Main Callback for getting data from DataGateway
 * @callback DataGateway~requestCallback
 * @param {Object} response JSON of response
 * @param {string} error message of AJAX error if occurs
 */

/**
 * dataPointUrl   URL for point request. Use {level} for level placeholder. For example: http://localhost/sunnycomb/getPoint/{level}
 * @type {String}
 * @private
 */
DataGateway.dataPointUrl = "";

/**
 * pointInfoUrl   URL for getting data of each point. Use {level} and {id} for placeholder.
 * @type {String}
 * @private
 */
DataGateway.pointInfoUrl = "";

/**
 * reportInfoUrl   URL for getting each report data. Use {id} for placeholder.
 * @type {String}
 * @private
 */
DataGateway.reportInfoUrl = "";

/**
 * Set URL for point request. Use {level} for level placeholder. For example: http://localhost/sunnycomb/getPoint/{level}
 * @param {String} url
 */
DataGateway.setDataPointUrl = function(url) {
  DataGateway.dataPointUrl = url;
}

/**
 * URL for getting data of each point. Use {level} and {id} for placeholder.
 * @param {String} url
 */
DataGateway.setPointInfoUrl = function(url) {
  DataGateway.pointInfoUrl = url;
}

/**
 * * getReportInfoUrl URL for getting each report data. Use {id} for placeholder.
 * @param {String} url
 */
DataGateway.setReportInfoUrl = function(url) {
  DataGateway.reportInfoUrl = url;
}


/**
 * Get all DataPoint for level.
 * @param  {Integer}   level   Level of detail (2=Country, 1=City/State, 0=Individual)
 * @param  {DataGateway~requestCallback} callback   Callback function
 * @async
 */
DataGateway.getDataPoint = function(level, callback) {

  if(!DataGateway.dataPointUrl) {
    callback(null, "dataPointUrl is not set.");
  } else {

    var url = DataGateway.dataPointUrl
                  .replace('{level}', level);

    DataGateway.requestData(url, function(response, error){

      if(error){
        callback([], error);
      } else {

        dataPoints = _.map(response, function(r){
          return new DataPoint(r);
        });

        callback(dataPoints, null);
      }
    });

  }

}

/**
 * Get detailed data for each DataPoint for displaying in side pane
 * @param  {integer}   level   Level of detail of the DataPoint
 * @param  {integer}   id      Id of DataPoint
 * @param  {DataGateway~requestCallback} callback   Callback function
 * @async
 */
DataGateway.getPointInfo = function(level, id, callback) {

  if(!DataGateway.pointInfoUrl) {
    callback(null, "pointInfoUrl is not set.");
  } else {
  
    var url = DataGateway.pointInfoUrl
                  .replace('{level}', level)
                  .replace('{id}', id);

    DataGateway.requestData(url, callback);

  }

}

/**
 * Get detailed data for each report
 * @param  {integer}   id      Id of report
 * @param  {DataGateway~requestCallback} callback   Callback function
 * @async
 */
DataGateway.getReportInfo = function(id, callback) {

  if(!DataGateway.reportInfoUrl) {
    callback(null, "reportInfoUrl is not set.");
  } else {

    var url = DataGateway.reportInfoUrl
                  .replace('{id}', id);

    DataGateway.requestData(url, callback);

  }

}

/**
 * Send ajax request to URL
 * @private
 * @param  {DataGateway~requestCallback} callback   Callback function
 * @async
 */
DataGateway.requestData = function(url, callback) {

  $.ajax({
    type: "GET",
    url: url,
    jsonp: "callback",
    dataType: "jsonp",
    success: function(response){
      callback(response, null)
    }, 
    error: function(jqXHR, errorStatus) {
      console.error("DataGateway.requestData: " + errorStatus);
      callback(null, errorStatus);
    }
  });

}
