var MAPBOX_REF = 'nuttt.ifb5eich';
var DATA_POINT_URL = 'http://localhost:8080/location/{level}';
var POINT_INFO_URL = 'http://localhost:8080/info/{level}/{id}';
var REPORT_INFO_URL = 'http://localhost:8080/report/{id}';

var jsLibrary = ['js/lib/jquery-2.1.1.min.js',
                 'js/lib/bootstrap.min.js',
                 'js/lib/underscore-min.js',
                 'js/lib/async.js',
                 'js/lib/bootstrap-lightbox.min.js'
                ];

var jsRequire = ['js/DataGateway.js',
                 'js/DataPoint.js',
                 'js/Map.js'
                ];

var jsLoad = jsLibrary.concat(jsRequire);

yepnope({
    load: jsLoad,
    complete: main      // when load complete, run main function
});

function main(){

    initializeDataGateway();

    var map = new Map('map', MAPBOX_REF, {
        minZoom: 3
    });

    map.setZoomListener(function(){
        drawMap(map);
    });

    map.setMarkerOnClickListener(function(e){
        geoJson = e.layer.feature;
        markerClickDelegate(geoJson);
    });

    initLightBox();

    $("#map-error").hide();

    // After 5 seconds, call drawMap every 10 seconds
    window.setTimeout(function(){

        async.forever(function(nextCallback){
            // console.log("sync!");
            drawMap(map, function(error){

                if(error) {
                    raiseMapAlert("Failed connecting to server.");
                } else {
                    fadeOutLandingPage();
                }

                window.setTimeout(function(){
                    nextCallback();
                }, 10000);

            });

        });

    },5000);
    
}

function fadeOutLandingPage(){
    $("#landing-page").fadeOut();
}

function initializeDataGateway(){
    DataGateway.setDataPointUrl(DATA_POINT_URL);
    DataGateway.setPointInfoUrl(POINT_INFO_URL);
    DataGateway.setReportInfoUrl(REPORT_INFO_URL);
}

function raiseMapAlert(str){
    $("#map-error").html(str).fadeIn().delay(5000).fadeOut();
}

function drawMap(map, callback) {

    if(!callback) {
        callback = function(){};
    }

    DataGateway.getDataPoint(map.preferredDataLevel(), function(dataPoints, error){
        
        if(!error) {
            map.setMarkers(dataPoints);
        }

        callback(error);
        
    });
    
}


function markerClickDelegate(geoJson) {

    var level = geoJson.properties.level;

    if(level === 0) {               // Individual Level
        showLightBox(geoJson.properties.id);
    } else {                        // Country and City Level
        drawPane(geoJson);
    }

}

function drawPane(geoJson) {

    var properties = geoJson.properties;

    DataGateway.getPointInfo(properties.level, properties.id, function(response, error){

        console.log(response);

        // set up info pane

        var name = response.name;
        var moods = response.moods;
        var topThumb = response.top_photo_thumbnails;

        // Set name
        
        $('#city-name').html(name);
        console.log(moods);

        // Set mood
        
        moods.forEach(function(elm, idx){

            var domId = "#mood" + (idx + 1);
            console.log(domId+" "+elm.mood_level+" "+elm.mood_percent);
            var moodHtml = $(domId);

            var words = ['', 'Bad', 'Meh', 'So so', 'Happy', 'Super Happy'];
            moodHtml.find('p').html(words[elm.mood_level]);

            moodHtml.find('h3').html(elm.mood_percent + '<span>%</span>');

            moodHtml.find('.mood-icon').attr('class', 'mood-icon mood-icon-' + elm.mood_level);

            _.range(6).forEach(function(i){
                moodHtml.removeClass('circle-mood-' + i);    
            });
            
            moodHtml.addClass('circle-mood-' + elm.mood_level);

        });

        // Set thumbnail
    
        var thumbHtml = '';
        var thumbHtmlTemplate = '<a href="" data-report-id="{id}" class="lightbox_trigger"><img src="{thumbUrl}" alt="" class="img-rounded"></a>';

        console.log(topThumb);
        topThumb.forEach(function(elm){

            thumbHtml += thumbHtmlTemplate
                            .replace('{id}', elm.id)
                            .replace('{thumbUrl}', elm.thumbnail_url);

        });

        $('#top-photos').html(thumbHtml);

        openPane();
    });
}

function openPane() {
  $("#info-wrapper").addClass("open-pane");
}

function closePane() {
  $("#info-wrapper").removeClass("open-pane");
} 


function initLightBox() {
    $('#top-photos').on('click', '.lightbox_trigger', function(e) {

            var reportId = $(this).data('report-id');
            
            showLightBox(reportId);

            // jQuery: prevent default action
            return false; 
    });

    $('body').on('click', '#lightbox', function() {
            hideLightBox();
    });
}

function showLightBox(reportId) {

    DataGateway.getReportInfo(reportId, function(report, error){

        console.log(report);

        if ($('#lightbox').length == 0) {
            var lightbox = 
            '<div id="lightbox">'+
                '<div class="inner">'+
                '</div>'+
            '</div>';
            $('body').append(lightbox);
        }

        $('#lightbox .inner').html('<img src="'+report.photo_url+'" /><span class="lightbox-span"><span class="mood-small mood-small-' + report.mood + '"></span>'+ report.name + ': [' + report.adjective.trim() + '] ' + report.note +'</span>');
        $('#lightbox').hide().fadeIn(400);

    });

}

function hideLightBox() {
    $('#lightbox').fadeOut(100);
}