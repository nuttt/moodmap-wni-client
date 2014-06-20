//getCityData('上海市');
function getCityData(name){
	console.log('get city '+name);
	$.getJSON('city.php?name='+name, function(data){
		console.log("test");
		// console.log(data);
		setMood('mood1', data['mood'][0], data['moodpercent'][0]);
		setMood('mood2', data['mood'][1], data['moodpercent'][1]);
		setMood('mood3', data['mood'][2], data['moodpercent'][2]);
		setCity(name);
		setPhotos(data['reports']);
	});
}

function setPhotos(reports){
	var photos = '';
	for(i in reports){
		photos += '<a href="'+reports[i]['photo']+'" data-tag="'+reports[i]['adjective']+' - '+reports[i]['name']+'" class="lightbox_trigger"><img src="'+reports[i]['thumb']+'" alt="" class="img-rounded"></a>';
		// photos += '<a href="#" class="lightbox_trigger"><img src="'+reports[i]['thumb']+'" alt="" class="img-rounded"></a>';
	}
	$('#top-photos').html(photos);
}
function setCity(name){
	$('#city-name').html(name);
}
function setMood(moodID, moodName, moodPercent){
	var ele = $('#'+moodID);
	console.log("Mood "+moodID+" "+moodName+" "+moodPercent);
	ele.find('div').attr('class', 'mood-icon mood-icon-'+moodName);
	ele.find('h3').html(moodPercent+'<span>%</span>');
	switch(parseInt(moodName)) {
		case 1:
				ele.find('p').html('Bad');
				break;
		case 2:
				ele.find('p').html('Meh');
				break;
		case 3:
				ele.find('p').html('So So');
				break;
		case 4:
				ele.find('p').html('Happy');
				break;
		case 5:
				ele.find('p').html('Super Happy');
				break;
		default:
				//nothing
	}
}
$('#top-photos').on('click', '.lightbox_trigger', function(e) {
		var image_href = $(this).attr('href');
		var tag = $(this).data('tag');
		if ($('#lightbox').length > 0) {
				$('#lightbox .inner').html('<img src="'+image_href+'" /><span>'+tag+'</span>');
				$('#lightbox').fadeIn(400);
		} else {
				var lightbox = 
				'<div id="lightbox">'+
					'<div class="inner">'+
						'<img src="'+image_href+'" />'+
						'<span>'+tag+'</span>'+
					'</div>'+
				'</div>';
				$('body').append(lightbox);
				$('#lightbox').hide().fadeIn(400);
		}
		return false; 
});
$('body').on('click', '#lightbox', function() {
		$('#lightbox').fadeOut(100);
});