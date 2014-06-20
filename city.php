
<?php 
$city = $_GET['name'];
$ch = curl_init();
$moodpercent[] = array(0,0,0,0,0);curl_setopt_array($ch, array(
	CURLOPT_URL => 'http://gsp.weathernews.jp/grpt6aa/gsp/tools/get_report_list.cgi',
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_PROXY => '172.16.20.214:8080',
	CURLOPT_POST => false,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_HTTPHEADER => array(
		'Content-Type: application/x-www-form-urlencoded',
		'Connection: keep-alive',
	),
));
$output = curl_exec($ch);
curl_close($ch);
$objs = json_decode($output);
$reports = array();
// Count mood and Move relavent reports to $reports
$mood = array(
	'1' => 0,
	'2' => 0,
	'3' => 0,
	'4' => 0,
	'5' => 0
);
$mood2 = array();
$moodpercent = array();
$mood_count = 0;
foreach($objs as $obj) {
	if($obj->location == $city){
		$reports[] = $obj;
		if($obj->skyfeel > 0 && $obj->skyfeel != ''){
			$mood[$obj->skyfeel]++;
			$mood_count++;
		}
	}
}

// Sort Photos
function compare_ncomments($a, $b) { 
    if($a->ncomments == $b->ncomments) {
        return 0 ;
    } 
  return ($a->ncomments > $b->ncomments) ? -1 : 1;
} 
usort($reports, 'compare_ncomments');

// Sort mood
// var_dump($mood);
arsort($mood);
if($mood_count){
	foreach($mood as $k => $v) {
		$mood2[] = $k;
		$moodpercent[] = round(($v/$mood_count)*100);
	}
} else {
	$mood2 = array('5','4','3','2','1');
	$moodpercent = array(0,0,0,0,0);
}
// Produce output
$results = array(
	'city' => $city,
	'mood' => $mood2,
	'moodpercent' => $moodpercent,
	'reports' => $reports

);
// var_dump($)
echo json_encode($results);
?>