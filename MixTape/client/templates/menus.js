

if (Meteor.isClient) {

	
	Template.menuPlaylists.helpers({
		'playlist': function(){
			return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
		},

		'activeClass': function(){
			return Session.equals('ACTIVE_PLAYLIST_KEY', this._id) && 'active';

		},
		'activeHeadingClass': function(){

			return Session.equals('ACTIVE_PLAYLIST_KEY', this._id) && 'active-menu-item-heading';

		},
		'showMenu': function(){

			return Session.equals('ACTIVE_PLAYLIST_KEY', this._id) && 'block';

		},

	});

	Template.menuClips.helpers({
		'clip': function(){
			var currentPlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
			return clipsDB.find({playlist:currentPlaylist},{sort: {rank: 1}});
		},

		'activeClass': function(){
			return Session.equals('ACTIVE_CLIP_KEY', this._id) && 'active';
		},

		'activeHeadingClass': function(){

			return Session.equals('ACTIVE_CLIP_KEY', this._id) && 'active-menu-item-heading';

		},

		'showMenu': function(){

			return Session.equals('ACTIVE_CLIP_KEY', this._id) && 'block';
		},

	});

	Template.menuBookmarks.helpers({
		'bookmark': function(){
			var currentClip = Session.get('ACTIVE_CLIP_KEY');
			var currentPlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
			var currentClipPlaylist = clipsDB.findOne(currentClip);
			if (currentClipPlaylist) currentClipPlaylist = currentClipPlaylist.playlist;

			if (currentClipPlaylist == currentPlaylist){
				return bookmarksDB.find({clip:currentClip},{sort: {rank: 1}});
			}
			
		},

		'activeClass': function(){
			return Session.equals('ACTIVE_BOOKMARK_KEY', this._id) && 'active';
		},
		'activeHeadingClass': function(){

			return Session.equals('ACTIVE_BOOKMARK_KEY', this._id) && 'active-menu-item-heading';

		},
		'showMenu': function(){

			return Session.equals('ACTIVE_BOOKMARK_KEY', this._id) && 'block';
		},

	});

	reorderMenus = function(ui, collection){
		if(collection.find({owner:Meteor.userId()}).count()>1){
		el = ui.item.get(0)
		before = ui.item.prev().get(0)
		after = ui.item.next().get(0)

		// Here is the part that blew my mind!
		//  Blaze.getData takes as a parameter an html element
		//    and will return the data context that was bound when
		//    that html element was rendered!
		if(!before) {
		//if it was dragged into the first position grab the
		// next element's data context and subtract one from the rank
		newRank = Blaze.getData(after).rank - 1;
		} else if(!after) {
		//if it was dragged into the last position grab the
		//  previous element's data context and add one to the rank
		newRank = Blaze.getData(before).rank + 1;
		}
		else
		//else take the average of the two ranks of the previous
		// and next elements
		newRank = (Blaze.getData(after).rank +
			Blaze.getData(before).rank)/2

		//update the dragged Item's rank
		collection.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
		}
	}

	Template.menuPlaylists.events({
		// I don't think there is a need for a play button here
		// 'mouseenter .playlist': function(event){
		// 	$('#' + this._id + ' div span').css( "visibility", "visible");
		// },

		// 'mouseleave .playlist': function(event){ 
		// 	$('#' + this._id + ' div span').css( "visibility", "hidden");
		// },

		'click .music-play-item-icon': function(event){
			console.log("hit the play")
		},

		'click .playlist': function(event){
			Session.set('ACTIVE_CLIP_KEY', null);
			var oldPlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
			Session.set('ACTIVE_PLAYLIST_KEY', this._id);
			var newPlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
			if (oldPlaylist != newPlaylist){
				if (oldPlaylist){	
					$( "#" + oldPlaylist + ">.active-menu-item-text" ).slideToggle(400);
				}
			
				$( "#" + this._id + ">.active-menu-item-text" ).slideToggle(400);
			}	
			var currentClipKey = Session.get('CURRENT_CLIP_KEY');
			if (currentClipKey){
				var currentClip = clipsDB.findOne(currentClipKey);
				if (currentClip.playlist == this._id){
					Session.set('ACTIVE_CLIP_KEY', currentClipKey);
					$( "#" + currentClipKey + ">.active-menu-item-text" ).slideToggle(400);
				}
			}
			
		}

	});

	Template.menuClips.events({
		'mouseenter .clip': function(event){
			$('#' + this._id + ' div .music-play-item-icon').css( "visibility", "visible");
		},

		'mouseleave .clip': function(event){ 
			$('#' + this._id + ' div .music-play-item-icon').css( "visibility", "hidden");
		},

		'click .music-play-item-icon': function(event){
			Session.set('CURRENT_CLIP_KEY', this._id);
			Session.set('CURRENT_BOOKMARK_KEY', null);
			Session.set('ACTIVE_BOOKMARK_KEY', null);
			MixTape.removeCurrentBookmark();
			var currentClipKey = Session.get('CURRENT_CLIP_KEY');
			var currentClipName = clipsDB.findOne(currentClipKey).name;
			//If another clip is waiting to be played, this interval should be stopped.
			if (waitForMetadata){
				clearInterval(checkMetadata);
			}
			MixTape.stopPlaying();
			MixTape.setCurrentClipPlayer(currentClipKey);
		},

		'click .clip': function(event){
			var oldClip = Session.get('ACTIVE_CLIP_KEY');
			Session.set('ACTIVE_CLIP_KEY', this._id);
			var newClip = Session.get('ACTIVE_CLIP_KEY');
			if (oldClip != newClip){
				if (oldClip){	
					$( "#" + oldClip + ">.active-menu-item-text" ).slideToggle(400);
				}
			
				$( "#" + this._id + ">.active-menu-item-text" ).slideToggle(400);
			}	
			
			var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
			if (currentBookmarkKey){
				var currentBookmark = bookmarksDB.findOne(currentBookmarkKey);
				if (currentBookmark.clip == this._id){
					Session.set('ACTIVE_BOOKMARK_KEY', currentBookmarkKey);
					$( "#" + currentBookmarkKey + ">.active-menu-item-text" ).slideToggle(400);
				}
			}
		}

	});

	Template.menuBookmarks.events({
		'mouseenter .bookmark': function(event){
			$('#' + this._id + ' div .music-play-item-icon').css( "visibility", "visible");
		},

		'mouseleave .bookmark': function(event){ 
			$('#' + this._id + ' div .music-play-item-icon').css( "visibility", "hidden");
		},
		
		'click .music-play-item-icon': function(event){
			Session.set('CURRENT_BOOKMARK_KEY', this._id);
			var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
			var currentBookmarkData = bookmarksDB.findOne(currentBookmarkKey);
			//Now need to check if there is a need of changing the source
			if (!Session.equals('CURRENT_CLIP_KEY', currentBookmarkData.clip)){
				console.log('different clip');
				var newClipKey = currentBookmarkData.clip;
				Session.set('CURRENT_CLIP_KEY', newClipKey);
				Session.set('ACTIVE_CLIP_KEY', newClipKey);
				console.log("The current clip " + currentBookmarkData.clip);
				if (waitForMetadata){
					clearInterval(checkMetadata);
				}
				MixTape.stopPlaying();
				MixTape.setCurrentClipPlayer(currentBookmarkData.clip, currentBookmarkKey);
				
				event.stopPropagation();
			}else{
				if(Session.equals('ACTIVE_BOOKMARK_KEY', this._id)){
					MixTape.restartBookmark();
					event.stopPropagation();
				}else{
					Session.set('ACTIVE_BOOKMARK_KEY', this._id);
					var selectedBookmarkKey = Session.get('ACTIVE_BOOKMARK_KEY');
					MixTape.setCurrentBookmark(selectedBookmarkKey, true);
					event.stopPropagation();
				}

			}
		},

		'click .bookmark': function(event){
			if(Session.equals('ACTIVE_BOOKMARK_KEY', this._id)){
				Session.set('ACTIVE_BOOKMARK_KEY', null);
				var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
				if (currentBookmarkKey){
					var currentBookmarkData = bookmarksDB.findOne(currentBookmarkKey);
					if (Session.equals('CURRENT_CLIP_KEY', currentBookmarkData.clip)){	
						MixTape.removeCurrentBookmark();
						Session.set('CURRENT_BOOKMARK_KEY', null);
					}
				}
				
				
			}else{
				Session.set('ACTIVE_BOOKMARK_KEY', this._id);
				var selectedBookmarkKey = Session.get('ACTIVE_BOOKMARK_KEY');
				$( "#" + this._id + ">.active-menu-item-text" ).slideToggle(400);
				MixTape.setCurrentBookmark(selectedBookmarkKey);
			}

			
		}

	});
}