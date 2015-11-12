MixTape = function() {};

Playlist = function(){
	this.type = 'playlist';
}

Playlist.prototype = {
	// all the prototypes functions
	name: function(){
		return playlistsDB.find({_id : this.dbId}).fetch()[0].name;
	},

	id: function(){
		return playlistsDB.find({_id : this.dbId}).fetch()[0].id;
	},

	setId: function(newId){
		playlistsDB.update(this.dbId, {$set: {id: newId} })

	},

	clips: function(){
		var clipData = clipsDB.find({playlist : this.dbId}, {sort: {sortOrder: 1}}).fetch();
		var clipObjects = new Array();
		clipData.forEach(function(clipObject){
			var clip = new Clip().init_existing_id(clipObject._id);
			// console.log(clip);			
			clipObjects.push(clip);

		})
		return clipObjects;
	},
	

	isBeingEdited: function(){
		return playlistsDB.find({_id : this.dbId}).fetch()[0].isBeingEdited;
	},
	
	// nospace: name.split('-').join('').split(' ').join('');

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

	// updateName: function(nameString){
	// 	this.name = nameString;
	// 	this.id = nameString.split('-').join('').split(' ').join('');
	// 	// this.nospace = nameString.split('-').join('').split(' ').join('');
	// },

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

Playlist.prototype.init_new = function(name){
	var ownerId = Meteor.userId();
	playlistsDB.insert({
		owner: ownerId,
		name : name,
		id: name.split('-').join('').split(' ').join(''),
		sortOrder : playlistsDB.find({owner : ownerId}).count() +1,
		text: '',
		isBeingEdited: false
	});
	this.dbId = playlistsDB.find({name : name}, {owner : Meteor.userId()}).fetch()[0]._id;


	return this;
}

// clip object
Clip = function(){
	this.type = 'clip';
}

Clip.prototype = {
	// declare all the functions that clip should support to inherit
	name: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].name;
	},

	playlist: function(){
		var playlistId = clipsDB.find({_id : this.dbId}).fetch()[0].playlist;
		return playlistsDB.find({_id : playlistId}).fetch()[0].name;
	},

	id: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].id;
	},

	setId: function(newId){
		clipsDB.update(this.dbId, {$set: {id: newId} })

	},

	bookmarks: function(){
		return bookmarksDB.find({clip : this.dbId}, {sort: {sortOrder: 1}}).fetch();
	},

	isBeingEdited: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].isBeingEdited;
	},
	source: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].source;
	},


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
				this.id = this.playlist.id() + '-' + nameString.split('-').join('').split(' ').join('');	
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
			this.id = this.playlist.id() + '-' + this.name.split('-').join('').split(' ').join('');			
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


Clip.prototype.init_new = function(name, playlist, src){
	console.log(playlist);
	var playlistId = playlistsDB.find({name : playlist.name()}).fetch()[0]._id;
	clipsDB.insert({
		owner : Meteor.userId(),
		playlist : playlistId,
		name : name,
		id: name.split('-').join('').split(' ').join(''),
		source : src,
		sortOrder : clipsDB.find({playlist : playlistId}).count() +1
	});
	this.dbId = clipsDB.find({name : name}, {playlist : playlistId}, {owner : Meteor.userId()}).fetch()[0]._id;
	return this;
}

Clip.prototype.init_existing_id = function(id){
	this.dbId = id;
	return this;
}

Bookmark  = function(){
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
	this.id = this.playlist.id() + '-' + this.clip.id + '-' + name.split('-').join('').split(' ').join('');
	this.isBeingEdited = false;
	return this;
}