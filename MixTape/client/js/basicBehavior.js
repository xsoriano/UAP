//Document for basic behaviour
$(document).ready(function() {
	console.log('Here 2');
	$('#addPlaylistBttn').click(function(e) {

	});

	$('#addClipBttn').click(function(e) {

	});

	$('#addBookmarkBttn').click(function(e) {
		
	});


	$('.bookmark').each(function() {
		$(this).click(function(e) {
			var name = ($(this).text()).trim();
			console.log(name);
			console.log(e.target);
		});
	});	
	
});