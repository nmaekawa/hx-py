// We use HTML5 Web Storage to keep an out-of-date version of the grades.
// This pre-populates the skill tree. It's just a visual nicety.
function getGradesFromLocalStorage() {

	// Make sure we have local storage.
	if(typeof(Storage) !== 'undefined') {

		var assignments = [];
		var names = [];
		var scores = [];

		// Store the grade details as JSON
		if(typeof localStorage.partNames !== 'undefined'){
			assignments = JSON.parse(localStorage.hxassignments);
			names = JSON.parse(localStorage.hxnames);
			scores = JSON.parse(localStorage.hxscores);
		}

		// Log the details and call displayTree
		console.log(assignments, names, scores);
		updateOutline(assignments, names, scores);

	}else{
		console.log('No local storage');
	}

}

// If we're going to use HTML5 Web Storage, we need to store things in it.
function storeGradesToLocalStorage(assignments, names, scores){

	// Make sure we have local storage.
	if(typeof(Storage) !== "undefined") {

		// Don't bother to coerce data types.
		// Javascript will treat strings like numbers anyway with ==.
		localStorage.hxassignments = JSON.stringify(assignments);
		localStorage.hxnames = JSON.stringify(names);
		localStorage.hxscores = JSON.stringify(scores);

	}else{
		console.log('No local storage');
	}

}

function updateOutline(assignments, names, scores){
  // Add text after every line that contains assignments.
	for(i = 0; i < names.length; i++){
		var lines = $('div.nav-sub:contains('+names[i]+')')
			.filter(function(index){
				// We need not just "contains" but an exact match.
				return $(this).text().trim() === names[i];
			});
		gradeInfo = '<span class="gradeInfo">'
			+ ' - ' + assignments [i] + ': ' + scores[i]
			+ '</span>'

		for(j = 0; j < lines.length; j++){
			// Duplicate lines are possible. Don't append if it's already there.
			if($(lines[j]).find('.gradeInfo').length == 0){
				console.log('appending');
				$(lines[j]).append(gradeInfo);
				break;
			}
		}
	}

}

// This goes through the Progress Page (loaded in the Raw HTML component), finds
// all of the grades, stores them in HTML5 local storage, and calls displayTree.
function updateScoresFromProgPage(){

	console.log('grade frame ready');
	// Turn off the loading bar.
	$('#progressbar').hide();

	var progpage = $('#yourprogress');

	// Get an array with all the text from the progress bar hovers.
	// This will need to be updated if the Progress page changes.
	var gradeText = progpage.contents().find('.xAxis span.sr').map(function() {
		return $(this).text();
  }).get();

	var assignments = [];
	var names = [];
	var scores = [];

	// This section is perhaps the most fragile. If the Progress page changes,
	// almost everything in this each() function will need to be updated.
	for(i=0; i<gradeText.length; i++){
		var bits = gradeText[i].split(' - ');
		if(bits.length == 3){
			assignments.push(bits[0]);
			names.push(bits[1]);
			scores.push(bits[2]);
		}
	}

	// Store in Web Storage and dispay on the outline.
	storeGradesToLocalStorage(assignments, names, scores);
	updateOutline(assignments, names, scores);

}


$(document).ready(function(){

	console.log('working');

	// Update from LocalStorage, if it's there.
	getGradesFromLocalStorage();

	// iFrame in the student's own progress page.
	// Need to replace this with something that adjusts the site's own URL,
	// so that we don't have to hardcode every course's progress page.
	var framey = '<iframe sandbox="allow-same-origin allow-scripts allow-popups allow-forms" aria-hidden="true" id="yourprogress" title="Your Progress Page" src="https://courses.edx.org/courses/course-v1:HarvardX+CHEM160+1T2017/progress" style="width:1px; height:1px; margin: 0px; border: none; display:none;" scrolling="no">Your browser does not support IFrames.</iframe>';
	$($('.xblock')[0]).append($(framey));

  // Once the progress page loads, update the outline with grades.
	$('iframe#yourprogress').load(function() {
		updateScoresFromProgPage();
	});

	setTimeout(function(){
		$('#progressbar').text('Unable to load your scores.')
	}, 10000);

});
