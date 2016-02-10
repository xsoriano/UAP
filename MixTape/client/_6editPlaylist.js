////////////////////////////////////////////////////////////////////////
/// editing playlist dialog functions
///////////////////////////////////////////////////////////////////////

$.validator.addMethod("noRepeatedEditingPlaylistNames", function(value, element) {
	var editingPlaylistKey = Session.get('EDITING_PLAYLIST');
	var editingPlaylist = playlistsDB.findOne({_id : editingPlaylistKey});
	if (editingPlaylist.name == value){
		return true;
	}else{
		return !(playlistsDB.find({name : value, owner : Meteor.userId()}).count()>0);
	}
	
  
}, "Another playlist with this name already exists.");

Template.editPlaylist.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},
	'activeClass': function(){
		return Session.equals("EDITING_PLAYLIST", this._id) && 'active';
	},
	'disabledClass': function(){
		return !Session.get("EDITING_PLAYLIST") && 'disabled';
	},
});

Template.editPlaylist.events({
	'mouseenter .ep-playlist': function(event){
		$('#' + this._id + ' .handle').css( "visibility", "visible");
	},

	'mouseleave .ep-playlist': function(event){ 
		$('#' + this._id + ' .handle').css( "visibility", "hidden");
	},

	'click .ep-playlist': function(event){
		Session.set("EDITING_PLAYLIST", this._id)
		$('#ep-name').val(this.name);
		$('#ep-notes').val(this.notes);
	},

	'click #delete-playlist-btn': function(event){
		deletePlaylist();
	},

	'submit form': function(event){
		event.preventDefault();
    }
});

Template.editPlaylist.onRendered(function() {
	this.$('#existingPlaylists').sortable({
		stop: function(e, ui) {
  			reorderMenus(ui, playlistsDB);
		},
		handle: '.handle' 
	});

	this.$('#edit-playlist-form').validate({
        rules: {
        	 name: {
                noRepeatedEditingPlaylistNames: true,
                required: true
            },
        },
        messages: {
        	name: {
                required: "You must enter an playlist name."
            },
        },
        submitHandler: function(event){
        	var newName = $('#ep-name').val();
        	var newNotes = $('#ep-notes').val();
        	updateEditingPlaylist(newName,newNotes);
        	
        }
    });

});


MixTape.editPlaylist = function(){
	var activePlaylistKey = Session.get('ACTIVE_PLAYLIST_KEY');
	Session.set('EDITING_PLAYLIST',null)
	if(activePlaylistKey){
		Session.set('EDITING_PLAYLIST', activePlaylistKey);
		var activePlaylist = playlistsDB.findOne(activePlaylistKey);
		$('#ep-name').val(activePlaylist.name);
		$('#ep-notes').val(activePlaylist.notes);
	}
	$('#editPlaylistWindow').modal('show'); 
}

function updateEditingPlaylist(name, notes){
	var editingPlaylist = Session.get('EDITING_PLAYLIST')
	playlistsDB.update(editingPlaylist, {
        $set: {name: name, notes: notes}
      });
	bootbox.alert({
		title: "Confirmation",
		
		message: "Your changes were saved", 

		buttons: {
	        ok: {
	            label: 'Ok',
	            className: 'btn-default'
	        }
    	},

		callback: clearEditingPlaylist(),
	
	});
}

function clearEditingPlaylist(){
	$('#ep-name').val('');
	$('#ep-notes').val('');
	Session.set('EDITING_PLAYLIST',null);
}

function deletePlaylist(){
	bootbox.confirm({
		title: "Playlist Deletion Confirmation",
		message: "Deleting this playlist, will also delete all its clips and bookmarks. This operation cannot be undone. Are you sure you want to delete this playlist?", 

		buttons: {
	        'cancel': {
	            label: 'Cancel',
	            className: 'btn-default'
	        },
	        'confirm': {
	            label: 'Delete',
	            className: 'btn-danger'
	        }
    	},

		callback: function(result) {
			if (result){
				var toDeletePlaylistKey = Session.get('EDITING_PLAYLIST');
				var playlistClips = clipsDB.find({playlist:toDeletePlaylistKey}).fetch();
				for (var i = 0;  i < playlistClips.length; i++){
					console.log(playlistClips[i]);
					var toDeleteClipKey = playlistClips[i]._id;
					var playlistBookmarks = bookmarksDB.find({clip:toDeleteClipKey}).fetch();
					for (var j = 0;  j < playlistBookmarks.length; j++){
						var toDeleteBookmarkKey = playlistBookmarks[j]._id;
						bookmarksDB.remove(toDeleteBookmarkKey);
					}
					clipsDB.remove(toDeleteClipKey);
				}
				playlistsDB.remove(toDeletePlaylistKey);
				clearEditingPlaylist();
			}	
		},
	});
}

MixTape.sourceClipsContainsName  = function(stringName){
	var isSource = false;
	for(var i = 0; i < musicfiles.length; i++){
		if(musicfiles[i] == stringName){
			isSource = true;
			break;
		}
	}
	return isSource;
}

// toggle it active and also add to the other side of the menu
MixTape.selectEditMusic = function(buttonName){
	if(buttonName.id){
		buttonName = buttonName.id;
	}
	$('#' + buttonName).addClass('active');  
	var button = document.getElementById(buttonName);
	button.setAttribute('onClick', 'removeEditMatching(this)');

	var otherMenu = document.getElementById('ep-added-container');
	MixTape.addItemToDialog(otherMenu, button.firstChild.innerHTML, '-matching', 'MixTape.removeMusic(this)');
}

MixTape.removeEditMatching = function(button){
	document.getElementById(button.id + '-matching').remove();
	$(button).toggleClass('active');
	document.getElementById(button.id).setAttribute('onClick', 'selectEditMusic(this)');
}

MixTape.saveEdit = function(){
	// hide the modal
	$('#editPlaylistWindow').modal('hide'); // close the dialog box

	// change the playlist name if different
	var playlistName = document.getElementById('edit-playlist-name').value;
	if(playlistName != currentPlaylist.name){
		if (playlistName == ''){
			playlistName = 'Playlist ' + (playlists.length + 1).toString();
		}
		// check to see if that playlist name already exists
		if (isPlaylistUsed(playlistName)){
			playlistName = playlistName + '-1';
		}
		currentPlaylist.updateName(playlistName); 
	}
	document.getElementById('recipient-name').value = '';

	// get the new clip order
	var newClips = [];
	var clips = document.getElementById('ep-added-container').getElementsByClassName('btn');
	if(clips.length > 0){
		for (var i = 0; i < clips.length; i++){
			// check to see if the clip already exists in the playlist (assume it's the same if it is)
			var temp = clips[i].id.split('-');
			if(playlistContainsClipName(temp.slice(0,temp.length -1).join('-')) > -1){
				// get the clip of that name and add
				newClips.push(currentPlaylist.clips[playlistContainsClipName(temp.slice(0,temp.length -1).join('-'))]);
			}
			else{
				var clip = new Clip().init_name(clips[i].textContent);
				clip.addSrc('http://mit.edu/xsoriano/www/music/' + clip.name + '.mp3');
				newClips.push(clip);
			}

		}
		currentPlaylist.removeAllClips();
		for(var i = 0; i < newClips.length; i++){
			currentPlaylist.addClip(newClips[i]);
		}
		setCurrentClip(0);
		MixTape.makeActive(document.getElementById(currentClip.id));
	}
	MixTape.updateMenus();
}

MixTape.playlistContainsClipName = function(clipname){
	var containsClip = -1;
	if(currentPlaylist.clips){
		for(var i = 0; i < currentPlaylist.clips.length; i++){
			if(currentPlaylist.clips[i].name == clipname){
				containsClip = i;
				break;
			}
		}
	}
	return containsClip;
}

MixTape.closeEditModal = function(){
	var container = document.getElementById('ep-computer-container');
	while(container.firstChild){
		container.firstChild.remove();
	}
	container = document.getElementById('ep-added-container');
	while(container.firstChild){
		container.firstChild.remove();
	}
}