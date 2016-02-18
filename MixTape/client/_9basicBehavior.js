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

	
	basicBehavior.centerTrackName();
	basicBehavior.setSectionHeights();

	$( window ).resize(function() {
  		// basicBehavior.centerBtnPlay();
		basicBehavior.centerTrackName();
	});
	// var playlistsSubscription = Meteor.subscribe('playlistsDB');
	// collectionLoadChecker = setInterval(function(){basicBehavior.loadPlaylists(playlistsSubscription);}, 1000);

	
});

basicBehavior.centerBtnPlay = function(){
	$('#btnPlay').css({margin:'10px 0 0 '+(-22 + $(document).width()/2 - $('#btnPlay').width())+'px'});
}

basicBehavior.centerTrackName = function(){
	$('#track-name-container').css({margin:'0 0 0 '+(- 15 + ($(document).width()-$('#track-name-container').width()) / 2)+'px'});
}

basicBehavior.setSectionHeights = function(){
	var sectionHeight = $("html").height() - $("#player-container").height() - $("#navbar").height() + $("#player-container").outerHeight( true ) + "px";
    $('.music-section').css("height", sectionHeight);
}

// basicBehavior.loadPlaylists = function(playlistsSubscription){
// 	//First make sure that nothing was in the playlist array already	
// 	console.log("Waiting for collection");
// 	if (playlistsSubscription.ready()) {
// 		console.log("It loaded!!");
// 		clearInterval(collectionLoadChecker);
//    		playlists.splice(0,playlists.length);
// 		var refreshedPlaylists = playlistsDB.find({owner : Meteor.userId()}, {sort: {sortOrder: 1} })
// 		refreshedPlaylists.forEach(function(e){
// 			playlists.push(new Playlist().init_existing_id(e._id));
// 		});
		
// 		if (playlists.length >0){
// 			MixTape.updateMenus();
// 			MixTape.setCurrentPlaylist(0);
// 		}
// 	}	

// }

basicBehavior.helloWorld = function(){
	console.log("hello world!");
}