
//Document for basic behaviour
$(document).ready(function() {
	console.log('In the basic behavior');
	MixTape.helloWorld();
	$('#addPlaylistBttn').click(function(e) {

	});

	$('#top-banner-new-playlist-btn').click(function(e){
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