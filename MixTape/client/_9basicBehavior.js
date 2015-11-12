basicBehavior = function() {};
//Document for basic behaviour
$(document).ready(function() {
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

	
	basicBehavior.centerBtnPlay();
	basicBehavior.centerTrackName();
	basicBehavior.setSectionHeights();

	$( window ).resize(function() {
  		basicBehavior.centerBtnPlay();
		basicBehavior.centerTrackName();
	});

	
});

basicBehavior.centerBtnPlay = function(){
	$('#btnPlay').css({margin:'10px 0 0 '+((-37 + $(document).width()-$('#btnPlay').width()) / 2)+'px'});
}

basicBehavior.centerTrackName = function(){
	$('#track-name-container').css({margin:'0 0 0 '+(($(document).width()-$('#track-name-container').width()) / 2)+'px'});
}

basicBehavior.setSectionHeights = function(){
	var sectionHeight = $("html").height() - $("#player-container").height() - $("#navbar").height() + $("#player-container").outerHeight( true ) + "px";
    $('.music-section').css("height", sectionHeight);
	
}