////////////////////////////////////////////////////////////////////////
/// editing playlist dialog functions
///////////////////////////////////////////////////////////////////////

$.validator.addMethod("noRepeatedEditingBookmarkNames", function(value, element) {
	var selectedClip = Session.get('SELECTED_EB_CLIP_KEY');
	var editingBookmarkKey = Session.get('EDITING_BOOKMARK_KEY');
	var editingBookmark = bookmarksDB.findOne({_id : editingBookmarkKey});
	if (editingBookmark.name == value){
		return true;
	}else{
		return !(bookmarksDB.find({name : value, clip : selectedClip, owner : Meteor.userId()}).count()>0);
	}
	
  
}, "Another bookmark with this name already exists.");

$.validator.addMethod("endAfterStartEditing", function(value, element) {
	if($('#eb-start').val() == '' || $('#eb-end').val() == ''){
      return true;
   	}else{
   		var startTimeVals = ($('#eb-start').val()).split(':');
   		var endTimeVals = ($('#eb-end').val()).split(':');
   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
   		return startTime < endTime;
   	}
  
}, "End time must be after start time.");

$.validator.addMethod("withinClipDurationTimeEditing", function(value, element) {
	if (Session.get('SELECTED_EB_CLIP_KEY')){
		var duration = clipsDB.findOne({_id:Session.get('SELECTED_EB_CLIP_KEY')}).duration;
		var vals = (value).split(':');
   		var time = parseInt(vals[0]) * 60 + parseInt(vals[1]);
   		return duration >= time && time>=0; 
	}
	return true;
  
}, "Must be within duration of the clip");

Template.editBookmark.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},
	'clip': function(){
		var selectedPlaylist = Session.get('SELECTED_EB_PLAYLIST_KEY');
		return clipsDB.find({owner:Meteor.userId(), playlist:selectedPlaylist},{sort: {rank: 1}});
	},
	'duration': function(){
		var durationSecs = this.duration;
		var mins = Math.floor(durationSecs/60);
		var secs = Math.floor(durationSecs)%60;
		var optZero = (secs < 10) ? '0' : '';
		var duration = mins + ':' + optZero + secs;
		return duration;		
	},
	'bookmark': function(){
		var selectedClip = Session.get('SELECTED_EB_CLIP_KEY');
		return bookmarksDB.find({owner:Meteor.userId(), clip:selectedClip},{sort: {rank: 1}});
	},
	'activeClass': function(){
		return Session.equals("EDITING_BOOKMARK_KEY", this._id) && 'active';
	},
	'disabledClass': function(){
		return !Session.get("EDITING_BOOKMARK_KEY") && 'disabled';
	},
	'isPlaylistSelected': function(){
		return Session.equals('SELECTED_EB_PLAYLIST_KEY', this._id) && 'selected';
	},
	'isClipSelected': function(){
		return Session.equals('SELECTED_EB_CLIP_KEY', this._id) && 'selected';
	},
});

Template.editBookmark.events({
	'mouseenter .eb-bookmark': function(event){
		$(event.target).find('.handle').css( "visibility", "visible");
	},

	'mouseleave .eb-bookmark': function(event){ 
		$(event.target).find('.handle').css( "visibility", "hidden");
	},

	'click .eb-bookmark': function(event){
		Session.set("EDITING_BOOKMARK_KEY", this._id)
		var editingBookmark = bookmarksDB.findOne({_id : this._id});
		updateEditingBookmarkForm(editingBookmark)
	},

	'change #eb-show-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_EB_PLAYLIST_KEY', newValue);
		Session.set('SELECTED_EB_CLIP_KEY', null);
		Session.set("EDITING_BOOKMARK_KEY", null)
		$('#edit-bookmark-form')[0].reset();
  	},

  	'change #eb-show-clip': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_EB_CLIP_KEY', newValue);
		Session.set("EDITING_BOOKMARK_KEY", null)
		$('#edit-bookmark-form')[0].reset();
  	},
  	'change #eb-start': function (event) {
		var currentTarget = event.currentTarget;
		var startTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(startTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var endTimeInput = $('#eb-end').val();
			var duration = parseInt($('#eb-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(endTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#eb-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#eb-end').val(endMins + ':' + optZero + endSecs);
			}
		}
  	},
  	'change #eb-end': function (event) {
  		var currentTarget = event.currentTarget;
		var endTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(endTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#eb-start').val();
			var duration = parseInt($('#eb-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#eb-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#eb-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},
  	'change #eb-duration': function (event) {
		var currentTarget = event.currentTarget;
		var durationInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		var numberReg = new RegExp('^[0-9]+$');
		if (numberReg.test(durationInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#eb-start').val();
			var endTimeInput = $('#neb-end').val();
			var duration = parseInt(durationInput);
			
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#eb-end').val(endMins + ':' + optZero + endSecs);
			}else if(timeReg.test(endTimeInput)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		console.log(endTime);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#eb-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},

	'click #delete-bookmark-btn': function(event){
		deleteBookmark();
	},

	'click .eb-close': function(event){
		clearEditingBookmark();
	},

	'submit form': function(event){
		event.preventDefault();
    }
});

Template.editBookmark.onRendered(function() {
	this.$('#existingBookmarks').sortable({
		stop: function(e, ui) {
  			reorderMenus(ui, bookmarksDB);
		},
		handle: '.handle' 
	});

	this.$('#edit-bookmark-form').validate({
        rules: {
        	name: {
                noRepeatedEditingBookmarkNames: true,
                required: true
            },
            start: {
            	required:true,
                time: true,
                withinClipDurationTimeEditing: true,
            },
            end: {
            	endAfterStartEditing: true,
            	time: true,
            	withinClipDurationTimeEditing: true,
            }

        },
        messages: {
        	name: {
                required: "You must enter a bookmark name.",
            },
            start: {
            	required: "Enter a start time for the bookmark.",
            }

        },
        submitHandler: function(event){
        	var newName = $('#eb-name').val();
        	var newStart = $('#eb-start').val();
        	var newEnd = $('#eb-end').val();
        	var newNotes = $('#eb-notes').val();
        	updateEditingBookmark(newName,newStart,newEnd,newNotes);
        	
        }
    });

});


MixTape.editBookmark = function(){
	$('#editBookmarkWindow').modal('show'); 
	var activePlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
	if(activePlaylist){
		Session.set('SELECTED_EB_PLAYLIST_KEY', activePlaylist);
		var activeClip = Session.get('ACTIVE_CLIP_KEY');
		if(activeClip){
			if (clipsDB.findOne({_id : activeClip}).playlist == activePlaylist){
				Session.set('SELECTED_EB_CLIP_KEY', activeClip);
				var activeBookmark = Session.get('ACTIVE_BOOKMARK_KEY');
				if(activeBookmark){
					var editingBookmark = bookmarksDB.findOne({_id : activeBookmark});
					if (editingBookmark.clip == activeClip){
						Session.set('EDITING_BOOKMARK_KEY', activeBookmark);
						updateEditingBookmarkForm(editingBookmark);
					}

				}
			}

		}
	}
}

function updateEditingBookmarkForm(editingBookmark){
	$('#eb-name').val(editingBookmark.name);
	var startMins = Math.floor(editingBookmark.startTime/60000);
	var startSecs = (Math.floor(editingBookmark.startTime/1000)%60);
	var optZero = (startSecs < 10) ? '0' : '';
	$('#eb-start').val(startMins + ':' + optZero + startSecs);
	var endMins = Math.floor(editingBookmark.endTime/60000);
	var endSecs = (Math.floor(editingBookmark.endTime/1000)%60);
	optZero = (endSecs < 10) ? '0' : '';
	$('#eb-end').val(endMins + ':' + optZero + endSecs);
	$('#eb-duration').val(Math.floor(editingBookmark.endTime-editingBookmark.startTime)/1000);
	$('#eb-notes').val(editingBookmark.notes);
}

function updateEditingBookmark(name, start, end, notes){
	var editingBookmark = Session.get('EDITING_BOOKMARK_KEY')
	var startTimeVals = (start).split(':');
	var endTimeVals = (end).split(':');
	var startMils = (parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]))*1000;
	var endMils = (parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]))*1000;
	bookmarksDB.update(editingBookmark, {
        $set: {name: name, startTime:startMils, endTime: endMils, notes: notes}
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

		callback: clearEditingBookmark(),
	
	});
}

function clearEditingBookmark(){
	$('#edit-bookmark-form')[0].reset();
	Session.set('EDITING_BOOKMARK_KEY',null);
	Session.set('SELECTED_EB_PLAYLIST_KEY',null);
	Session.set('SELECTED_EB_CLIP_KEY',null);
}

function deleteBookmark(){
	bootbox.confirm({
		title: "Bookmark Deletion Confirmation",
		message: "You are about to delete a bookmark. This operation cannot be undone. Are you sure you want to delete this bookmark?", 

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
				var toDeleteBookmarkKey = Session.get('EDITING_BOOKMARK_KEY');
				bookmarksDB.remove(toDeleteBookmarkKey);
				clearEditingBookmark();
			}	
		},
	});
}

