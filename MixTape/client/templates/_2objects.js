/////////////////////////////////////// I think this is the proper way
// playlist javascript doesn't have constructor overloading
function Playlist(){
	this.type = 'playlist';
	this.text = '';
	this.isBeingEdited = false;
}
Playlist.prototype = {
	// all the prototypes functions
	addClip: function(newClip){
		//Should we check for the existence of the clip in the clip list?. What would clip equality be in that case?
		// How does javascript take care of this? I will just check for the name for now. -X
		var canAdd = true;
		for (var i = 0; i < this.clips.length; i++){
			if (this.clips[i].name == newClip.name){
				canAdd = false;
			}
		} 
		if (canAdd){
			this.clips.push(newClip);
			newClip.updatePlaylist(this);
		} 
		return canAdd;
	},

	removeClip: function(toRemoveClip){
		var index = this.clips.indexOf(toRemoveClip);
		if (index>-1){
    		this.clips.splice(index, 1);
		}
	},

	addText: function(newText){
		this.text = newText;
	},

	removeText: function(){
		this.text = "";
	},

	updateName: function(nameString){
		this.name = nameString;
		this.id = nameString.split('-').join('').split(' ').join('');
		this.nospace = nameString.split('-').join('').split(' ').join('');
	},

	changeIsBeingEdited: function(){
		this.isBeingEdited = !(this.isBeingEdited);
	},

	remove: function(){
		while (this.clips.length > 0){
			this.clips[0].remove();
		}
	},

	removeAllClips: function(){
		this.clips = [];
	}

}
// constructor with just the name
Playlist.prototype.init_name = function(name){
	this.name = name;
	this.id = name.split('-').join('').split(' ').join('');
	this.nospace = name.split('-').join('').split(' ').join('');
	this.clips = [];
	this.isBeingEdited = false;
	return this;
}

// clip object
function Clip(){
	this.type = 'clip';
	this.text = '';
	this.isBeingEdited = false;
}

Clip.prototype = {
	// declare all the functions that clip should support to inherit
	addBookmark: function(newBookmark){
		//Should we check for the existence of the clip in the clip list?. What would clip equality be in that case?
		// How does javascript take care of this? I will just check for the name for now. -
		//GABRIEL Debug
		console.log("Adding bookmark to " + this.name);
		var canAdd = true;
		for (var i = 0; i < this.bookmarks.length; i++){
			if (this.bookmarks[i].name == newBookmark.name){
				canAdd = false;
			}
		} 
		if (canAdd) {
			this.bookmarks.push(newBookmark);
			newBookmark.updateClip(this);
		}
		return canAdd;
	},

	removeBookmark: function(toRemoveBookmark){
		var index = this.bookmarks.indexOf(toRemoveBookmark);
		if (index>-1){
    		this.bookmarks.splice(index, 1);
		}
	},
	
	// set the src file for the clip (so we can change the name)
	addSrc: function(srcString){
		this.src = srcString;
	},

	addText: function(newText){
		this.text = newText;
	},

	removeText: function(){
		this.text = "";
	},

	updateName: function(nameString){
		this.name = nameString;
		if(this.url == null){
			if(this.playlist){
				this.id = this.playlist.id + '-' + nameString.split('-').join('').split(' ').join('');	
			}
			else{
				this.id = nameString.split('-').join('').split(' ').join('');			
			}
		}

		this.nospace = nameString.split('-').join('').split(' ').join('');
	},

	updatePlaylist: function(playlist){
		this.playlist = playlist;
		if(this.url == null){
			this.id = this.playlist.id + '-' + this.name.split('-').join('').split(' ').join('');			
		}
	},

	changeIsBeingEdited: function(){
		this.isBeingEdited = !(this.isBeingEdited);
	},

	remove: function(){
		while (this.bookmarks.length > 0){
			this.bookmarks.pop();
		}

		this.playlist.removeClip(this);
	}	

};

Clip.prototype.init_name = function(name){
	this.name = name;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.bookmarks = [];
	this.isBeingEdited = false;
	return this;
}

Clip.prototype.init_url = function(name, url){
	this.name = name;
	this.url = url;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.bookmarks = [];
	this.isBeingEdited = false;
	return this;
}

Clip.prototype.init_url_playlist = function(id, url, playlist){
	this.name = url;
	this.id = id;
	this.url = url;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.bookmarks = [];
	this.isBeingEdited = false;
	this.playlist = playlist;
	return this;
}

Clip.prototype.init_name_playlist = function(name, playlist){
	this.name = name;
	this.playlist = playlist; //This is the parent/container playlist.
	//This can possibly be the id that will be given to the corresponding html tag: P<playlist name>C<clip name>B<bookmark name>
	this.id = this.playlist.id + '-' + name.split('-').join('').split(' ').join('');
	this.nospace = name.split('-').join('').split(' ').join('');
	this.bookmarks = [];
	this.isBeingEdited = false;
	return this;
}

function Bookmark(){
	this.type = 'bookmark';
	this.text = '';
	this.startTime = -1; //In milliseconds
	this.endTime = -1; //In milliseconds
	this.isBeingEdited = false;
}

Bookmark.prototype = {
	addText: function(newText){
		this.text = newText;
	},

	removeText: function(){
		this.text = "";
	},

	updateName: function(nameString){
		this.name = nameString;
		if(this.clip){
			this.id = this.clip.id + '-' + nameString.split('-').join('').split(' ').join('');
		}
		else{
			this.id = nameString.split('-').join('').split(' ').join('');
		}
		this.nospace = nameString.split('-').join('').split(' ').join('');
	},

	updateClip: function(clip){
		this.clip = clip;
		this.id = this.clip.id + '-' + this.name.split('-').join('').split(' ').join('');
	},

	changeIsBeingEdited: function(){
		this.isBeingEdited = !(this.isBeingEdited);
	},

	remove: function(){
		this.clip.removeBookmark(this);
	}	
}

Bookmark.prototype.init_name = function(name){
	this.name = name;
	this.isBeingEdited = false;
	return this;
}

Bookmark.prototype.init_name_times = function(name, startTime, endTime){
	this.name = name;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.startTime = startTime;
	this.endTime = endTime;
	this.isBeingEdited = false;
	return this;
}

Bookmark.prototype.init_name_clip = function(name, clip){
	this.name = name;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.clip = clip;
	//This can possibly be the id that will be given to the corresponding html tag: P<playlist name>C<clip name>B<bookmark name>
	this.id = this.clip.id + '-' + name.split('-').join('').split(' ').join('');
	this.isBeingEdited = false;
	return this;
}

Bookmark.prototype.init_name_clip_playlist = function(name, clip, playlist){
	this.name = name;
	this.nospace = name.split('-').join('').split(' ').join('');
	this.clip = clip;
	this.playlist = playlist;
	this.id = this.playlist.id + '-' + this.clip.id + '-' + name.split('-').join('').split(' ').join('');
	this.isBeingEdited = false;
	return this;
}