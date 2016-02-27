dragging_thumb = false;
interval_function = null;
clip_time_length_ms = null;
clip_time_played_ms = null; //Time of the currently selected clip, in milliseconds.
bookmark_time_start = null;
bookmark_time_end = null;
waitForMetadata = false;
checkBuffering = null;
checkMetadata = null;
playingClip = null;

Template.player.events({
	'mousedown #progress_thumb_id' : function(event){
		MixTape.startDragging(event);
    },
    'mousemove #progress_thumb_id' : function(event){
		MixTape.hoverTrack(event);
    },
    'mouseout #progress_thumb_id' : function(event){
		MixTape.unHover(event);
    },
    
    'click #track_id' : function(event){
		MixTape.clickTrack(event);
    },
    'mousemove #track_id' : function(event){
		MixTape.hoverTrack(event);
    },
    'mouseout #track_id' : function(event){
		MixTape.unHover(event);
    },
    'click #progress_bar_id' : function(event){
		MixTape.clickTrack(event);
    },
    'mousemove #progress_bar_id' : function(event){
		MixTape.hoverTrack(event);
    },
    'mouseout #progress_bar_id' : function(event){
		MixTape.unHover(event);
    },
    'click #btnPlay' : function(event){
		MixTape.togglePlay();
    },
    'canplay #current-clip' : function(event){
		stopWaitingForCanPlay();
    },
    'playing #current-clip' : function(event){
		Session.set('wait_for_buffering',false);
    },
    'waiting #current-clip' : function(event){
		Session.set('wait_for_buffering',true);
    },
    'error #current-clip' : function(event){
		console.log('I should do a lot of helpful things over here!!');
    },
    'dragstart #progress_thumb_id' : function(event){
		if(!Session.get('CURRENT_CLIP_KEY')) event.preventDefault();
    },
});


Template.player.onRendered(function() {
	$(document).on('mouseup', function(event){
		MixTape.endDragging(event);
    });
    $(document).on('mousemove', function(event){
		MixTape.hoverTrackWhileDragging(event);
    });
    $( window ).resize(function(){
		console.log("Document resized!")
		var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');		
		if(currentBookmarkKey){
			var bookmarkData = bookmarksDB.findOne(currentBookmarkKey);
			var bookmarkStart = bookmarkData.startTime;
			var bookmarkEnd = bookmarkData.endTime;
			adjustBookmarkers(bookmarkStart, bookmarkEnd);
		}
    });

	$('#heb-switch').bootstrapSwitch();

	$('#heb-switch').on('switchChange.bootstrapSwitch', function(event, state) {
	  if(state){
			$('#heb-container > .glyphicon').css('color','#31b0d5');
			bootbox.alert({
				title: "Fast Bookmarking Mode",
				
				message: "You are going into Fast Bookmarking Mode. When on this mode, you can rapidily mark interesting parts of a playing clip by hitting the key 'b' while listening. Happy Bookmarking!", 

				buttons: {
			        ok: {
			            label: 'Ok',
			            className: 'btn-default'
			        }
		    	},

				callback: enterHEB(),
			
			});
		}else{
			$('#heb-container > .glyphicon').css('color','gray');
			exitHEB();
		}
		$('#heb-container > .bootstrap-switch').tooltip('hide');
		$(this).blur();
	});
	$('#heb-container > .bootstrap-switch').tooltip({title: "Fast Bookmarking Mode", delay: {show: 500, hide: 75}, placement: "bottom"}); 

	$('#progress_thumb_id').draggable({
	    helper: function() {
        	clearInterval(interval_function);
        	return $(this);

	    }, 

	    containment: "#track_id",
	    axis : "x"

	});

	$('#current-clip')[0].loop = false;
});

$(document).ready(function() {
    
    


    var music_clip_window = document.getElementById('music-clip-window');
    var progress_bar = document.getElementById('progress_bar_id');
    var track = document.getElementById('track_id');
    var progress_thumb = document.getElementById('progress_thumb_id');
    

    // progress_thumb.addEventListener('mousedown', MixTape.startDragging);
    // progress_thumb.addEventListener('mousemove', MixTape.hoverTrack);
    // document.addEventListener('mouseup', MixTape.endDragging);
    // track.addEventListener('click', MixTape.clickTrack);
    // progress_bar.addEventListener('click', MixTape.clickTrack);

    // track.addEventListener('mousemove', MixTape.hoverTrack);
    // progress_bar.addEventListener('mousemove', MixTape.hoverTrack);
    // track.addEventListener('mouseout', MixTape.unHover);
    // progress_bar.addEventListener('mouseout', MixTape.unHover);

    // document.addEventListener('mousemove', MixTape.hoverTrackWhileDragging);


    // var btnPlay = document.getElementById('btnPlay');
    // btnPlay.addEventListener('click', MixTape.togglePlay);

    // var clip = document.getElementById('current-clip');
    // clip.loop = false;
    
    // clip.addEventListener('canplay', function() {
    // 	stopWaitingForCanPlay()  	
    // });
	//Gabriel Modifications. END
	// clip.addEventListener('playing', function() {
	// 	Session.set('wait_for_buffering',false);
	// });
	// clip.addEventListener('waiting', function() {
	// 	Session.set('wait_for_buffering',true);
	// });
	// clip.addEventListener('error', function() {
	// 	console.log('couldnt play track');
	// });
	
});


function enterHEB(){
	$(document).keypress(function(e) {
	  console.log( e.which );
	  if (e.which == 98){ 	
	  	if(isPlaying() && !($('.modal.in').length>0)){
	  		createNewBookmarkHEB();
	  		console.log("Create a bookmark")
	  	}
	  }
	});
}

function exitHEB(){
	$(document).off("keypress");
}

function createNewBookmarkHEB(){
	var parentClip = Session.get('CURRENT_CLIP_KEY');
	var bookmarkRank = (bookmarksDB.find({owner: Meteor.userId(), clip: parentClip}).count()>0) ? bookmarksDB.findOne({clip: parentClip}, {sort: {rank: -1}}).rank + 0.05 : 0;
	var startTimeMils = $('#current-clip')[0].currentTime*1000;
	var endTimeMils = $('#current-clip')[0].duration*1000;
	var bookmarkName = 'Bookmark'+$('#current-clip')[0].currentTime+'s';
	if (bookmarksDB.find({name:bookmarkName}).count() > 0) bookmarkName = bookmarkName + ' (1)';
	bookmarksDB.insert({
		owner : Meteor.userId(),
		name : bookmarkName,
		clip: parentClip,
		rank : bookmarkRank,
		startTime: startTimeMils,
		endTime: endTimeMils,
		notes: '',
	});
}

function isPlaying() { 
	return !$('#current-clip')[0].paused; 
}

function stopWaitingForCanPlay(){
	var currentClipKey = Session.get('CURRENT_CLIP_KEY');

	var clip_time_length_ms = document.getElementById('current-clip').duration*1000;
	Session.set('clip_duration', clip_time_length_ms);

	if (waitForMetadata){
		waitForMetadata = false
	}

}
//Change by Xavier
MixTape.focusBookmarkTextbox= function(){
	$("#inputStartTime").focus();
}

MixTape.setCurrentClipPlayer = function(currentClipKey, currentBookmarkKey){
	var clipData = clipsDB.findOne(currentClipKey);
	var clipSource = clipData.source;
	var clipName = clipData.name;
	var clipDuration = clipData.duration;

	if (!currentClipKey){
		document.getElementById('current-clip').src = null;
	} else {
		console.log()
		document.getElementById('current-clip').src = clipSource;
		MixTape.updateUIForNewClip(clipName, clipDuration);
		waitForMetadata = true;
		checkMetadata = setInterval(function () {
			console.log('playWhenMetadataLoaded')
			if (!waitForMetadata){
				clearInterval(checkMetadata);
				MixTape.startClip();
				if (currentBookmarkKey){
					Session.set('ACTIVE_BOOKMARK_KEY', currentBookmarkKey);
					MixTape.setCurrentBookmark(currentBookmarkKey);
				}
			}

		}, 250);

	}
}

MixTape.updateUIForNewClip = function(currentClipName, duration){
	$("#track-name-container>span").html(currentClipName);
	var thumbContri = $('#progress_thumb_id').width()/2
	document.getElementById('progress_thumb_id').style.left = - thumbContri+'px';
	document.getElementById('progress_bar_id').style.width = 0+'px';
	clip_time_played_ms = 0;
	$(".time_passed").html("0:00");
	//May want to update the end time as well.
	console.log(duration);
	durInSecs = Math.floor(duration); 
	endTimeMins = Math.floor(durInSecs/60);
	endTimeSecs = durInSecs % 60;
	if(endTimeSecs < 10){
		$(".time_length").html(endTimeMins+":0"+endTimeSecs);
	}else{
		$(".time_length").html(endTimeMins+":"+endTimeSecs);
	}
}


MixTape.setCurrentBookmark = function(selectedBookmarkId, forcePlay){
	var bookmarkData = bookmarksDB.findOne(selectedBookmarkId);
	var bookmarkClip = bookmarkData.clip;	
	if(Session.equals('CURRENT_CLIP_KEY',bookmarkClip)){
		Session.set('CURRENT_BOOKMARK_KEY', selectedBookmarkId);
		clearInterval(checkBuffering);
		var bookmarkStart = bookmarkData.startTime;
		var bookmarkEnd = bookmarkData.endTime;
		clip_time_played_ms = bookmarkStart;
		if (Session.get('playing')){
			checkBuffering = setInterval(function () {
				var waitForBuffering = Session.get('wait_for_buffering');
				if (!waitForBuffering){
					clearInterval(checkBuffering);
					MixTape.adjustBookmarkMarkers(bookmarkStart, bookmarkEnd);
				}
			}, 250);
		}
		else{
			if (forcePlay){
				MixTape.togglePlay();
			} 
			MixTape.adjustBookmarkMarkers(bookmarkStart,bookmarkEnd);
		}	
	}
}

MixTape.removeCurrentBookmark = function(){
	MixTape.adjustBookmarkMarkers();
}

MixTape.restartBookmark = function(){
	clearInterval(checkBuffering);
	if (!Session.get('playing')){
		MixTape.togglePlay();
	}
	checkBuffering = setInterval(function () {
			var waitForBuffering = Session.get('wait_for_buffering');
			if (!waitForBuffering){
				clearInterval(checkBuffering);
				MixTape.resetProgressElements();
			}
		}, 250);
	
}

function adjustBookmarkers(bookmarkStart, bookmarkEnd){
	if(bookmarkStart && bookmarkEnd){
		var clip = document.getElementById('current-clip');

		//Changung HTML
		var start_minutes = Math.floor(bookmarkStart/(60*1000));
		var start_seconds = Math.floor(bookmarkStart/1000)%60;
		if(start_seconds < 10){
			$("#bookmark_time_start").html(""+start_minutes+":0"+start_seconds);
		}else{
			$("#bookmark_time_start").html(""+start_minutes+":"+start_seconds);
		}

		var end_minutes = Math.floor(bookmarkEnd/(60*1000));
		var end_seconds = Math.floor(bookmarkEnd/1000)%60;
		if(end_seconds < 10){
			$("#bookmark_time_end").html(""+end_minutes+":0"+end_seconds);
		}else{
			$("#bookmark_time_end").html(""+end_minutes+":"+end_seconds);
		}

		//Changing position
		var clip_time_length_ms = Session.get('clip_duration');
		var progress_percent = bookmarkStart/clip_time_length_ms;
		
		var offset = $('#track_background_id').width();
		var thumbContri = $('#progress_thumb_id').width()/2;

		if (!isPlaying()){
			MixTape.adjustProgressElements();
		}

		
		document.getElementById('bookmark_marker_start').style.left = (offset*progress_percent - thumbContri + 1) +'px';
		document.getElementById('bookmark_time_start').style.left = (offset*progress_percent - thumbContri - 19)+'px';

		progress_percent = bookmarkEnd/clip_time_length_ms;

		
		document.getElementById('bookmark_marker_end').style.left = (offset*progress_percent - thumbContri - 1)+'px';
		document.getElementById('bookmark_time_end').style.left = (offset*progress_percent - thumbContri + 5)+'px';

		document.getElementById('bookmark_marker_start').style.visibility = 'visible';
		document.getElementById('bookmark_marker_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_start').style.visibility = 'visible';
	}
}

//Author: Gabrielj. Called in setCurrentBookmark. Meant to adjust the bookmark markers and the displayed times accordingly.
MixTape.adjustBookmarkMarkers = function(bookmarkStart, bookmarkEnd){
	if(bookmarkStart && bookmarkEnd){
		var clip = document.getElementById('current-clip');

		clip.currentTime = Math.floor(clip_time_played_ms/1000);

		//Changung HTML
		var start_minutes = Math.floor(bookmarkStart/(60*1000));
		var start_seconds = Math.floor(bookmarkStart/1000)%60;
		if(start_seconds < 10){
			$("#bookmark_time_start").html(""+start_minutes+":0"+start_seconds);
		}else{
			$("#bookmark_time_start").html(""+start_minutes+":"+start_seconds);
		}

		var end_minutes = Math.floor(bookmarkEnd/(60*1000));
		var end_seconds = Math.floor(bookmarkEnd/1000)%60;
		if(end_seconds < 10){
			$("#bookmark_time_end").html(""+end_minutes+":0"+end_seconds);
		}else{
			$("#bookmark_time_end").html(""+end_minutes+":"+end_seconds);
		}

		//Changing position
		var clip_time_length_ms = Session.get('clip_duration');
		var progress_percent = bookmarkStart/clip_time_length_ms;
		
		var offset = $('#track_background_id').width();
		var thumbContri = $('#progress_thumb_id').width()/2
		document.getElementById('progress_thumb_id').style.left = (offset*progress_percent- thumbContri)+'px';
		document.getElementById('progress_bar_id').style.width = (offset*progress_percent)+'px';

		
		document.getElementById('bookmark_marker_start').style.left = (offset*progress_percent - thumbContri + 1) +'px';
		document.getElementById('bookmark_time_start').style.left = (offset*progress_percent - thumbContri - 19)+'px';

		progress_percent = bookmarkEnd/clip_time_length_ms;

		
		document.getElementById('bookmark_marker_end').style.left = (offset*progress_percent - thumbContri - 1)+'px';
		document.getElementById('bookmark_time_end').style.left = (offset*progress_percent - thumbContri + 5)+'px';

		document.getElementById('bookmark_marker_start').style.visibility = 'visible';
		document.getElementById('bookmark_marker_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_start').style.visibility = 'visible';
		MixTape.updateTimePassed();


	} else{
		document.getElementById('bookmark_time_start').style.left = (0 - 6)+'px';
		document.getElementById('bookmark_marker_start').style.left = (0 + 1) +'px';
		document.getElementById('bookmark_marker_start').style.visibility = 'hidden';
		document.getElementById('bookmark_marker_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_start').style.visibility = 'hidden';
		// var playing = Session.get('playing');
		// if(playing){
		// 	MixTape.togglePlay();
		// }
		//Gabrielj. Changes to behavior. Now getting rid of bookmark resets progress elements
	}
}


//Sets the variable 'dragging_thumb' to true
MixTape.startDragging= function(e){
        dragging_thumb = true;
        console.log("Start dragging");
}

//Sets the variable 'dragging_thumb' to false
MixTape.endDragging= function(e){
	if(dragging_thumb){
		dragging_thumb = false;
		MixTape.unHover();
		if(Session.get('playing')){
			interval_function = setInterval(function () {MixTape.trackTimer()}, 250);
		}			
		MixTape.clickTrack(e);
console.log("End dragging");
	}
}




//Update time_passed
MixTape.updateTimePassed = function(){
	var currentClip = Session.get('CURRENT_CLIP_KEY');
	var clip_time_length_ms = Session.get('clip_duration');
	if (currentClip){
		if (clip_time_played_ms < clip_time_length_ms){
			var minutes = Math.floor(clip_time_played_ms/(60*1000));
			var seconds = Math.floor(clip_time_played_ms/1000)%60;
			if(seconds < 10){
				$(".time_passed").html(""+minutes+":0"+seconds);
			}else{
				$(".time_passed").html(""+minutes+":"+seconds);
			}
		}	
	}
}

MixTape.resetProgressElements = function(){
	var currentBookmark = Session.get('CURRENT_BOOKMARK_KEY');

	if(currentBookmark){
		var bookmarkData = bookmarksDB.findOne(currentBookmark);
		var bookmarkStart = bookmarkData.startTime;
		var leftPos = $('#bookmark_marker_start').position().left;
		var thumbContri = $('#progress_thumb_id').width()/2
		document.getElementById('progress_thumb_id').style.left = leftPos - thumbContri+'px';
		document.getElementById('progress_bar_id').style.width = leftPos+'px';
		clip_time_played_ms = bookmarkStart;
		var clip = document.getElementById('current-clip');
		clip.currentTime = Math.floor(clip_time_played_ms/1000);
	} else{
		document.getElementById('progress_thumb_id').style.left = 0 - $('#progress_thumb_id').width()/2 +'px';
		document.getElementById('progress_bar_id').style.width = 0+'px';
		clip_time_played_ms = 0;
	}
	MixTape.updateTimePassed();
}


MixTape.adjustProgressElements = function(){
	var clip_time_length_ms = Session.get('clip_duration');
	var progress_percent = clip_time_played_ms/clip_time_length_ms;
	//console.log('Percent played: ' + progress_percent);
	var thumbContri = $('#progress_thumb_id').width()/2
	var offset = document.getElementById('track_background_id').offsetWidth;
	document.getElementById('progress_thumb_id').style.left = (offset * progress_percent - thumbContri)+'px';
	document.getElementById('progress_bar_id').style.width = (offset*progress_percent)+'px';

	MixTape.updateTimePassed();

}

MixTape.stopPlaying = function(){
	var playing = Session.get('playing');
	if(playing){
		$('#btnPlay_icon').removeClass('glyphicon-pause');
		if  (!($('#btnPlay_icon').hasClass('glyphicon-play'))){
			$('#btnPlay_icon').addClass('glyphicon-play');
			$('#btnPlay').addClass('disabled');
		}
		Session.set('playing', false);
		clearInterval(interval_function);
		var clip = document.getElementById('current-clip');
		clip.pause();
		console.log('Stopped Playing');
	}
}

MixTape.startClip = function(){
	var currentClip = Session.get('CURRENT_CLIP_KEY');
	if (currentClip){
		$('#btnPlay_icon').removeClass('glyphicon-play');
		if  (!($('#btnPlay_icon').hasClass('glyphicon-pause'))){
			$('#btnPlay_icon').addClass('glyphicon-pause');
			$('#btnPlay').removeClass('disabled');
		}
		var playing = Session.get('playing');
		if(!playing){
			Session.set('playing', true);
			var clip = document.getElementById('current-clip');
			clip.play();
			interval_function = setInterval(function () {MixTape.trackTimer()}, 250);	
			console.log('Started Playing', clip.currentTime);
		}
	}
}


MixTape.togglePlay = function(e){
	console.log('togglePlay');
	var currentClip = Session.get('CURRENT_CLIP_KEY');
	if (currentClip && !($('#btnPlay').hasClass('disabled'))){
		$('#btnPlay_icon').toggleClass('glyphicon-play');
		$('#btnPlay_icon').toggleClass('glyphicon-pause');
		var playing = Session.get('playing');
		if(playing){
			Session.set('playing', false);
			clearInterval(interval_function);
			var clip = document.getElementById('current-clip');
			clip.pause();
			
		} else {
			Session.set('playing', true);
			var clip = document.getElementById('current-clip');
			clip.play();
			interval_function = setInterval(function () {MixTape.trackTimer()}, 250);	
			console.log('in toggle play play', clip.currentTime);
		}
	}
}

MixTape.trackTimer= function() {
	// var ActiveBookmarkKey = Session.get('CURRENT_CLIP_KEY');
	// if(is_bookmark_selected){
	// 	if(clip_time_played_ms >= bookmark_time_end){
	// 		MixTape.togglePlay();
	// 		clearInterval(interval_function);
	// 		MixTape.resetProgressElements();
	// 		//console.log('clip time played',clip_time_played_ms, 'trackTimer()')
	// 	} else{
	// 		clip_time_played_ms += 250;
	// 		MixTape.adjustProgressElements();
	// 	}
	// } else{
		// Change by Xavier
		// added condition that if the currentSrc becomes null, then the track player should stop moving.
		var currentClipKey = Session.get('CURRENT_CLIP_KEY');
		if (currentClipKey){
			var currentClip = clipsDB.findOne(currentClipKey);
			var clip_time_length_ms = Session.get('clip_duration');
			if(clip_time_played_ms >= clip_time_length_ms || currentClip.source == null){
				MixTape.togglePlay();
				clearInterval(interval_function);
				MixTape.resetProgressElements();
				//console.log('clip time played',clip_time_played_ms, 'trackTimer()')
			} else{
				clip_time_played_ms += 250;
				MixTape.adjustProgressElements();
			}
		}
	//console.log('Time played in ms: ' + clip_time_played_ms);
	// }

}

MixTape.clickTrack = function(e){
	var currentClipKey = Session.get('CURRENT_CLIP_KEY');
	if (currentClipKey){
		currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
		var new_pos = ''+(e.clientX-$('#track_id').offset().left);
		var thumbContri = $('#progress_thumb_id').width()/2;
		if(currentBookmarkKey){
			
			var left_position = $('#bookmark_marker_start').position().left;
			var right_position = $('#bookmark_marker_end').position().left;

			if(new_pos < left_position){
				console.log("left position")
				document.getElementById('progress_thumb_id').style.left = left_position +'px';
				document.getElementById('progress_bar_id').style.width = left_position + thumbContri +'px';
			} else if(new_pos > right_position){
				document.getElementById('progress_thumb_id').style.left = right_position +'px';
				document.getElementById('progress_bar_id').style.width = right_position - thumbContri+'px';
			} else {
				document.getElementById('progress_thumb_id').style.left = new_pos - thumbContri+'px';
				document.getElementById('progress_bar_id').style.width = new_pos+'px';
			}
			

		} else{

			if(new_pos < 0){
				document.getElementById('progress_thumb_id').style.left = - thumbContri +'px';
				document.getElementById('progress_bar_id').style.width = - thumbContri+'px';
			} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
				document.getElementById('progress_thumb_id').style.left = (document.getElementById('track_background_id').offsetWidth - thumbContri)+'px';
				document.getElementById('progress_bar_id').style.width = document.getElementById('track_background_id').offsetWidth + thumbContri+'px';
			} else {
				document.getElementById('progress_thumb_id').style.left = (new_pos - thumbContri) +'px';
				document.getElementById('progress_bar_id').style.width = new_pos+'px';
			}
		}

		var current_width = document.getElementById('progress_bar_id').offsetWidth;
		var max_width = document.getElementById('track_background_id').offsetWidth;
		var progress_percent = current_width/max_width;
		var clip_time_length_ms = Session.get('clip_duration');
		clip_time_played_ms = (clip_time_length_ms*progress_percent);
		clip_time_played_ms = Math.floor(clip_time_played_ms/1000)*1000;
		
		MixTape.updateTimePassed();

		var clip = document.getElementById('current-clip');
		clip.currentTime = Math.floor(clip_time_played_ms/1000);
		// autoplay
		var playing = Session.get('playing');
		if (playing){
			clip.play();
		}
	}
}

MixTape.hoverTrackWhileDragging = function(e){
	if(dragging_thumb){
		MixTape.hoverTrack(e);
		$('#progress_bar_id').width($('#progress_thumb_id').position().left + $('#progress_thumb_id').width()/2);
	}
}



MixTape.hoverTrack = function(e){
	var currentClipKey = Session.get('CURRENT_CLIP_KEY');
	if (currentClipKey){
		var new_pos = ''+(e.clientX-$('#track_id').offset().left);
		var max_width = document.getElementById('track_background_id').offsetWidth;
		var hoverContri = $('#hover_time_id').width()/2;
		if(new_pos < 0){
			//document.getElementById('progress_thumb_id').style.left = 0+'px';
			//document.getElementById('progress_bar_id').style.width = 0+'px';
		} else if(new_pos > max_width){
			document.getElementById('hover_time_id').style.left = max_width - hoverContri+'px';
		} else {
			document.getElementById('hover_time_id').style.left = new_pos - hoverContri +'px';
		}
		var current_left = $('#hover_time_id').position().left + hoverContri;
		var progress_percent = current_left/max_width;
		var clip_time_length_ms = Session.get('clip_duration');
		var clip_time = (clip_time_length_ms*progress_percent);
		clip_time = Math.floor(clip_time/1000)*1000;

		var minutes = Math.floor(clip_time/(60*1000));
		var seconds = Math.floor(clip_time/1000)%60;
		if(seconds < 10){
			$("#hover_time_id").html(""+minutes+":0"+seconds);
		}else{
			$("#hover_time_id").html(""+minutes+":"+seconds);
		}
	}
}

MixTape.unHover= function(e) {
	$("#hover_time_id").html("");
}
