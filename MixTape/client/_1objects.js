MixTape = function() {};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////Playlist Object///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Clip Object///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

	siblings: function(){
		var playlistId = clipsDB.find({_id : this.dbId}).fetch()[0].playlist;
		var clipData = clipsDB.find({playlist : playlistId}, {sort: {sortOrder: 1}}).fetch();
		var clipObjects = new Array();
		clipData.forEach(function(clipObject){
			var clip = new Clip().init_existing_id(clipObject._id);
			// console.log(clip);			
			clipObjects.push(clip);

		})
		return clipObjects;
	},

	id: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].id;
	},

	setId: function(newId){
		clipsDB.update(this.dbId, {$set: {id: newId} })

	},

	bookmarks: function(){
		var bookmarkData = bookmarksDB.find({clip : this.dbId}, {sort: {sortOrder: 1}}).fetch();
		var bookmarkObjects = new Array();
		bookmarkData.forEach(function(bookmarkObject){
			var bookmark = new Bookmark().init_existing_id(bookmarkObject._id);
			// console.log(clip);			
			bookmarkObjects.push(bookmark);

		})
		return bookmarkObjects;
	},



	isBeingEdited: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].isBeingEdited;
	},
	source: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].source;
	},
	isBeingEdited: function(){
		return clipsDB.find({_id : this.dbId}).fetch()[0].isBeingEdited;
	},

	//We dont need to add bookmarks anymore. They know who they belong to.
	// addBookmark: function(newBookmark){

	// 	var canAdd = (bookmarksDB.find({"name": newBookmark, "clip": this.dbId}, {limit:1}).count() == 0);
	// 	//This was the non DB way of checking if the bookmark is already there.
	// 	// for (var i = 0; i < this.bookmarks.length; i++){
	// 	// 	if (this.bookmarks[i].name == newBookmark.name){
	// 	// 		canAdd = false;
	// 	// 	}
	// 	// } 
	// 	if (canAdd) {
	// 		this.bookmarks.push(newBookmark);
	// 		//newBookmark.updateClip(this);
	// 	}
	// 	return canAdd;
	// },

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
	
	//var playlistId = playlistsDB.find({name : playlist.name()}).fetch()[0]._id;
	// It seems that we can get away with just finding the dbId of the passed playlist.
	var playlistId = playlist.dbId;
	clipsDB.insert({
		owner : Meteor.userId(),
		playlist : playlistId,
		name : name,
		id: name.split('-').join('').split(' ').join(''),
		source : src,
		sortOrder : clipsDB.find({playlist : playlistId}).count() +1,
		text: '',
		isBeingEdited: false
	});
	this.dbId = clipsDB.find({name : name}, {playlist : playlistId}, {owner : Meteor.userId()}).fetch()[0]._id;
	return this;
}

Clip.prototype.init_existing_id = function(id){
	this.dbId = id;
	return this;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////Bookmark Object///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Bookmark  = function(){
	this.type = 'bookmark';
	// this.startTime = -1; //In milliseconds
	// this.endTime = -1; //In milliseconds
	// this.isBeingEdited = false;
}

Bookmark.prototype = {
	name: function(){
		return bookmarksDB.find({_id : this.dbId}).fetch()[0].name;
	},

	clip: function(){
		var clipId = bookmarksDB.find({_id : this.dbId}).fetch()[0].clip;
		return clipsDB.find({_id : clipId}).fetch()[0].name;
	},

	id: function(){
		return bookmarksDB.find({_id : this.dbId}).fetch()[0].id;
	},

	setId: function(newId){
		bookmarksDB.update(this.dbId, {$set: {id: newId} })

	},
	startTime: function(){
		return bookmarksDB.find({_id : this.dbId}).fetch()[0].startTime;
	},
	endTime: function(){
		return bookmarksDB.find({_id : this.dbId}).fetch()[0].endTime;
	},
	isBeingEdited: function(){
		return bookmarksDB.find({_id : this.dbId}).fetch()[0].isBeingEdited;
	},
	siblings: function(){
		var clipId = bookmarksDB.find({_id : this.dbId}).fetch()[0].clip;
		var bookmarkData = bookmarksDB.find({clip : clipId}, {sort: {sortOrder: 1}}).fetch();
		var bookmarkObjects = new Array();
		bookmarkData.forEach(function(bookmarkObject){
			var bookmark = new Bookmark().init_existing_id(bookmarkObject._id);
			// console.log(clip);			
			bookmarkObjects.push(bookmark);

		})
		return bookmarkObjects;
	},


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

Bookmark.prototype.init_new = function(name, clip, startTime, endTime){
	// var clipId = clipsDB.find({name : clip.name()}).fetch()[0]._id;
	// It seems that we can get away with just finding the dbId of the passed playlist.
	var clipId = clip.dbId;
	bookmarksDB.insert({
		owner : Meteor.userId(),
		clip : clipId,
		name : name,
		id: name.split('-').join('').split(' ').join(''),
		startTime: startTime,
		endTime: endTime,
		sortOrder : bookmarksDB.find({clip : clipId}).count() +1,
		text: '',
		isBeingEdited: false
	});
	this.dbId = bookmarksDB.find({name : name}, {clip : clipId}, {owner : Meteor.userId()}).fetch()[0]._id;
	return this;
}

Bookmark.prototype.init_existing_id = function(id){
	this.dbId = id;
	return this;
}