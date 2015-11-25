Controller = function() {};

Controller = {

	refreshPlaylists : function(){
		
		var refreshedPlaylists = playlistsDB.find({owner : Meteor.userId()}, {sort: {sortOrder: 1} })
		console.log("Hello, from controller;");
		console.log(refreshedPlaylists.count());
		refreshedPlaylists.forEach(function(e){
			playlists.push(new Playlist().init_existing_id(e._id));
		});
	}
}