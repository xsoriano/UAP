
	var SEMAPHORE = 0; 	
	var bookmarkId;

$.validator.addMethod("time", function(value, element) {
	var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
	console.log(element);
	return timeReg.test(value) || value=='';
  
}, "Must follow the format mm:ss");

$.validator.addMethod("endAfterStart", function(value, element) {
	if($('#new-bookmark-start').val() == '' || $('#new-bookmark-end').val() == ''){
      return true;
   	}else{
   		var startTimeVals = ($('#new-bookmark-start').val()).split(':');
   		var endTimeVals = ($('#new-bookmark-end').val()).split(':');
   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
   		return startTime < endTime;
   	}
  
}, "End time must be after start time.");

$.validator.addMethod("withinClipDurationTime", function(value, element) {
	if (Session.get('SELECTED_NB_CLIP_KEY')){
		var duration = clipsDB.findOne({_id:Session.get('SELECTED_NB_CLIP_KEY')}).duration;
		var vals = (value).split(':');
   		var time = parseInt(vals[0]) * 60 + parseInt(vals[1]);
   		return duration >= time && time>=0; 
	}
	return true;
  
}, "Must be within duration of the clip");

$.validator.addMethod("noRepeatedBookmarkNames", function(value, element) {
	var selectedClip = Session.get('SELECTED_NB_CLIP_KEY');
	return !(bookmarksDB.find({name : value, clip : selectedClip}).count()>0);
  
}, "A Bookmark with this name already exists.");



Template.newBookmark.helpers({
	'playlist': function(){
		return playlistsDB.find({owner:Meteor.userId()},{sort: {rank: 1}});
	},

	'isPlaylistSelected': function(){
		return Session.equals('SELECTED_NB_PLAYLIST_KEY', this._id) && 'selected';
	},
	'clip': function(){
		var currentPlaylist = Session.get('SELECTED_NB_PLAYLIST_KEY');
		return clipsDB.find({playlist:currentPlaylist},{sort: {rank: 1}});
	},
	'duration': function(){
		var durationSecs = this.duration;
		var mins = Math.floor(durationSecs/60);
		var secs = Math.floor(durationSecs)%60;
		var optZero = (secs < 10) ? '0' : '';
		var duration = mins + ':' + optZero + secs;
		return duration;		
	},
	'isClipSelected': function(){
		return Session.equals('SELECTED_NB_CLIP_KEY', this._id) && 'selected';

	},

	});

Template.newBookmark.events({
	'change #new-bookmark-playlist': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_NB_PLAYLIST_KEY', newValue);
		Session.set('SELECTED_NB_CLIP_KEY', null);
  	},
  	'change #new-bookmark-clip': function (event) {
		var currentTarget = event.currentTarget;
		var newValue = currentTarget.options[currentTarget.selectedIndex].value;
		Session.set('SELECTED_NB_CLIP_KEY', newValue);
  	},
  	'change #new-bookmark-start': function (event) {
		var currentTarget = event.currentTarget;
		var startTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(startTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var endTimeInput = $('#new-bookmark-end').val();
			var duration = parseInt($('#new-bookmark-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(endTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#new-bookmark-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#new-bookmark-end').val(endMins + ':' + optZero + endSecs);
			}
		}
  	},
  	'change #new-bookmark-end': function (event) {
  		var currentTarget = event.currentTarget;
		var endTimeInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		if (timeReg.test(endTimeInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#new-bookmark-start').val();
			var duration = parseInt($('#new-bookmark-duration').val());
			var numberReg = new RegExp('^[0-9]+$');
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var endTimeVals = endTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		$('#new-bookmark-duration').val(endTime-startTime);
			}else if(numberReg.test(duration)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#new-bookmark-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},
  	'change #new-bookmark-duration': function (event) {
		var currentTarget = event.currentTarget;
		var durationInput = $(currentTarget).val();
		var timeReg = new RegExp('^[0-9]+:[0-5][0-9]$');
		var numberReg = new RegExp('^[0-9]+$');
		if (numberReg.test(durationInput)){
			// Session.set('START_TIME_ENTERED', true);
			var startTimeInput = $('#new-bookmark-start').val();
			var endTimeInput = $('#new-bookmark-end').val();
			var duration = parseInt(durationInput);
			
			if (timeReg.test(startTimeInput)){
				var startTimeVals = startTimeInput.split(':');
		   		var startTime = parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]);
		   		var endPos = startTime + duration;
		   		var endMins = Math.floor(endPos / 60);
		   		var endSecs = Math.floor(endPos % 60);
		   		var optZero = (0<=endSecs && endSecs<10) ? '0' : '';
		   		$('#new-bookmark-end').val(endMins + ':' + optZero + endSecs);
			}else if(timeReg.test(endTimeInput)){
				var endTimeVals = endTimeInput.split(':');
		   		var endTime = parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]);
		   		console.log(endTime);
		   		var startPos = endTime - duration;
		   		var startMins = Math.floor(startPos / 60);
		   		var startSecs = Math.floor(startPos % 60);
		   		var optZero = (0<=startSecs && startSecs<10) ? '0' : '';
		   		$('#new-bookmark-start').val(startMins + ':' + optZero + startSecs);
		   	}
		}
  	},
  	'submit form': function(event){
		event.preventDefault();
    }
});

Template.newBookmark.onRendered(function(){
    var validator = $('#add-bookmark-form').validate({
        rules: {
            name: {
                required: true,
                noRepeatedBookmarkNames: true,
            },
            playlist: {
            	required: true,
            },
            clip: {
            	required: true,
            },
            start: {
                required:true,
                time: true,
                withinClipDurationTime: true,
            },
            end: {
            	time: true,
            	endAfterStart: true,
            	withinClipDurationTime: true,
            }
        },
        messages: {
            name: {
                required: "You must enter a bookmark name.",
            },
            playlist: {
                required: "You must select a playlist.",
            },
            clip: {
                required: "You must select a clip.",
            },
            start: {
                required: "Enter a start time for the bookmark.",
            }
        },
        submitHandler: function(event){
        	createNewBookmark($('#new-bookmark-name').val(), $('#new-bookmark-clip').val(),
        						 $('#new-bookmark-start').val(), $('#new-bookmark-end').val(), $('#new-bookmark-notes').val());
        	$('#nb-top-btn-close').trigger('click');   
        }
    });
});

MixTape.openNewBookmarkWindow = function() {
	$('#newBookmarkWindow').modal('show');
	var activePlaylist = Session.get('ACTIVE_PLAYLIST_KEY');
	if(activePlaylist){
		Session.set('SELECTED_NB_PLAYLIST_KEY', activePlaylist);
		var activeClip = Session.get('ACTIVE_CLIP_KEY');
		if(activeClip){
			if (clipsDB.findOne({_id : activeClip}).playlist == activePlaylist){
				Session.set('SELECTED_NB_CLIP_KEY', activeClip);
			}	
		}
	}

}

MixTape.clearNewBookmarModal = function(){
	$('#add-bookmark-form')[0].reset();
	Session.set('SELECTED_NB_CLIP_KEY', null);
	Session.set('SELECTED_NB_PLAYLIST_KEY', null);
}

function createNewBookmark(bookmarkName, parentClip, startTimeInput, endTimeInput, bookmarkNotes){
	var bookmarkRank = (bookmarksDB.find({owner: Meteor.userId(), clip: parentClip}).count()>0) ? bookmarksDB.findOne({clip: parentClip}, {sort: {rank: -1}}).rank + 0.05 : 0;
	var startTimeVals = (startTimeInput).split(':');
	var endTimeVals = (endTimeInput).split(':');
	var startTimeSecs = (parseInt(startTimeVals[0]) * 60 + parseInt(startTimeVals[1]))*1000;
	var endTimeSecs = (parseInt(endTimeVals[0]) * 60 + parseInt(endTimeVals[1]))*1000;
	bookmarksDB.insert({
		owner : Meteor.userId(),
		name : bookmarkName,
		clip: parentClip,
		rank : bookmarkRank,
		startTime: startTimeSecs,
		endTime: endTimeSecs,
		notes: bookmarkNotes,
	});
}



	