playlistMenu = null; // these are the menu containers
clipMenu = null;
bookmarkMenu = null;

// currentPlaylist = null; // these are the current item/object
// currentClip = null;
// currentBookmark = null;

currentPlaylistIndex = null;
currentBookmarkIndex = null;
currentClipIndex = null;
playlists = []; // this will hold all the created playlists

dragging_thumb = false;

playing_clip = false;
interval_function = null;
clip_time_length_ms = null;
clip_time_played_ms = null; //Time of the currently selected clip, in milliseconds.

selected_bookmark_identifier = null;
selectedPlaylist = null;
bookmark_time_start = null;
bookmark_time_end = null;



waitForMetadata = false;
checkBuffering = null;
checkMetadata = null;
//End change by Xavier
playingClip = null;

$(document).ready(function() {
    //Gabriel Modifications. START
    var music_clip_window = document.getElementById('music-clip-window');
    var progress_bar = document.getElementById('progress_bar_id');
    var track = document.getElementById('track_id');
    var progress_thumb = document.getElementById('progress_thumb_id');
    $('#progress_thumb_id').draggable({
    helper: function() {
        clearInterval(interval_function);
        return $(this);
    }, 

    containment: "#track_id",
    axis : "x"

	});
    var bookmark_btn = document.getElementById('btnBookmark');
    var input_start_time = document.getElementById('inputStartTime');
    var input_end_time = document.getElementById('inputEndTime');

    input_start_time.addEventListener("focus", MixTape.clearHelpText);
    input_end_time.addEventListener("focus", MixTape.clearHelpText);
    bookmark_btn.addEventListener('click', MixTape.addNewBookmark);

    progress_thumb.addEventListener('mousedown', MixTape.startDragging);
    progress_thumb.addEventListener('mousemove', MixTape.hoverTrack);
    document.addEventListener('mouseup', MixTape.endDragging);
    track.addEventListener('click', MixTape.clickTrack);
    progress_bar.addEventListener('click', MixTape.clickTrack);

    track.addEventListener('mousemove', MixTape.hoverTrack);
    progress_bar.addEventListener('mousemove', MixTape.hoverTrack);
    track.addEventListener('mouseout', MixTape.unHover);
    progress_bar.addEventListener('mouseout', MixTape.unHover);

    document.addEventListener('mousemove', MixTape.hoverTrackWhileDragging);


    var btnPlay = document.getElementById('btnPlay');
    btnPlay.addEventListener('click', MixTape.togglePlay);

    var clip = document.getElementById('current-clip');
    clip.loop = false;
    
    clip.addEventListener('loadedmetadata', function() {
    	console.log('loaded meta data!');
    	var currentClipKey = Session.get('CURRENT_CLIP_KEY');

    	var clip_time_length_ms = document.getElementById('current-clip').duration*1000;
    	Session.set('clip_duration', clip_time_length_ms);
    	console.log(clip_time_length_ms);
    	var minutes = Math.floor(clip_time_length_ms/(1000*60));
    	var seconds = Math.floor(clip_time_length_ms/1000)%60;

    	// no time value shows if no clip available
    	if (!currentClipKey){
    		$(".time_length").html("");
    		$(".time_passed").html("");
    	} else {
    		if(seconds < 10){
    			$(".time_length").html(""+minutes+":0"+seconds);
    		}else{
    			$(".time_length").html(""+minutes+":"+seconds);
    		}
    		$(".time_passed").html("0:00");
    	}

    	if (waitForMetadata){
    		waitForMetadata = false
    	}

    	var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
    	// if (currentBookmarkKey){
    	// 	console.log(currentClipKey);
    	// 	console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    	// 	var currentBookmark = bookmarksDB.find({_id:currentBookmarkKey}).fetch()[0];
    	// 	var bookmarkClip = currentBookmark.clip;
    	// 	console.log(currentClip == bookmarkClip);
    	// 	console.log(currentClip == bookmarkClip);

    	// 	if(currentClip != bookmarkClip){
    	// 		MixTape.setCurrentBookmark();
    	// 	}else{
    	// 		MixTape.setCurrentBookmark(currentBookmarkKey);
    	// 	}
    	// } else{
    	// 	console.log("11$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    	// 	MixTape.adjustBookmarkMarkers();
    	// 	MixTape.resetProgressElements();
    	// }	

    	//isLoadingMetadata = false;

    });
	//Gabriel Modifications. END
	clip.addEventListener('playing', function() {
		Session.set('wait_for_buffering',false);
	});
	clip.addEventListener('waiting', function() {
		Session.set('wait_for_buffering',true);
	});
	
});

//Change by Xavier
MixTape.focusBookmarkTextbox= function(){
	$("#inputStartTime").focus();
}

//Gabriel Modification. START

//Author: Gabrielj. Adds bookmarks to bookmark list
MixTape.addNewBookmark= function(e){
	if(currentSrc != null){
		var start_time = $(inputStartTime).val();
		var end_time = $(inputEndTime).val();
		var array_start_time = start_time.split(":");
		var array_end_time = end_time.split(":");
		console.log(array_end_time[0]);
		console.log(array_end_time[1]);
		if (array_end_time == "" & array_start_time == ""){
			var clip_time_length_ms = Session.get('clip_duration');
			var clip = document.getElementById('current-clip');
			console.log(clip);
			start_time = clip.currentTime*1000; //In milliseconds
			end_time = clip_time_length_ms; //In milliseconds
			var minutes = Math.floor(clip_time_played_ms/(60*1000));
			var seconds = Math.floor(clip_time_played_ms/1000)%60;
			var bookmark_name = 'Bookmark ' + (playingClip.bookmarks.length+1) + ' '+minutes+'m'+seconds+'s';
			var new_bookmark = new Bookmark().init_new(bookmark_name, currentClip, start_time, end_time);
			// This is not needed anymore, because bookmarks in the DB know who their clip is.
			// playingClip.addBookmark(new_bookmark);
			for(var i = 0; i < playlists.length; i++){
				if(playingClip.playlist.id == playlists[i].id){
					MixTape.setCurrentPlaylist(i);
				}
			}
			var playingClipSiblings = playingClip.siblings();
			for(var i = 0; i < playingClipSiblings.length; i++){
				console.log(playingClipSiblings[i].id());
				console.log(playingClip.id);
				if(playingClip.id == playingClipSiblings[i].id()){
					MixTape.setCurrentClip(i);
				}
			}
			MixTape.updateMenus();
		} else if(array_start_time.length != 2 || array_end_time.length != 2 
			|| isNaN(parseInt(array_start_time[0])) || isNaN(parseInt(array_start_time[1])) 
			|| isNaN(parseInt(array_end_time[0])) || isNaN(parseInt(array_end_time[1])) 
			|| parseInt(array_start_time[1])>60 ||  parseInt(array_end_time[1])>60
			|| parseInt(array_start_time[1])<0 ||  parseInt(array_end_time[1])<0 ){
			$(inputStartTime).val("Format 'mm:ss'");
			$(inputEndTime).val("Format 'mm:ss'");
		} else {
			start_time = parseInt(array_start_time[0])*60*1000 + parseInt(array_start_time[1])*1000; //In milliseconds
			end_time = parseInt(array_end_time[0])*60*1000 + parseInt(array_end_time[1])*1000; //In milliseconds
			//console.log(start_time);
			//console.log(end_time);
			if(start_time >= 0 && start_time < clip_time_length_ms){
				if(end_time > start_time && end_time < clip_time_length_ms){
					var bookmark_name = ('Bookmark ' + (playingClip.bookmarks.length+1)+' '+array_start_time[0]+'m'+array_start_time[1]
						+'s to ' + array_end_time[0]+'m'+array_end_time[1]+'s');
					var new_bookmark = new Bookmark().init_name_times(bookmark_name, start_time, end_time);

					playingClip.addBookmark(new_bookmark);
					for(var i = 0; i < playlists.length; i++){
						if(playingClip.playlist.id == playlists[i].id){
							MixTape.setCurrentPlaylist(i);
						}
					}
					for(var i = 0; i < playingClip.playlist.clips.length; i++){
						if(playingClip.id == playingClip.playlist.clips[i].id){
							MixTape.setCurrentClip(i);
						}
					}
					MixTape.updateMenus();
					document.getElementById('inputStartTime').value = '';
        			document.getElementById('inputEndTime').value = '';
					console.log("Done adding");
				}
			}
		}
	}
	else{
		$(inputStartTime).val("Double click clip!");
		$(inputEndTime).val("Double click clip!");
	}
}

MixTape.setCurrentClipPlayer = function(currentClipKey, currentBookmarkKey){
	var clipData = clipsDB.find({_id:currentClipKey}).fetch()[0];
	var clipSource = clipData.source;
	var clipName = clipData.name;
	var clipStart = clipData.startTime;
	var clipEnd = clipData.endTime;

	if (!currentClipKey){
		document.getElementById('current-clip').src = null;
	} else {
		console.log()
		document.getElementById('current-clip').src = clipSource;
		MixTape.updateUIForNewClip(clipName, clipStart, clipEnd);
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

MixTape.updateUIForNewClip = function(currentClipName, startTime, endTime){
	$("#track-name-container").html("<a>"+ currentClipName + "</a>");
	basicBehavior.centerTrackName();
	document.getElementById('progress_thumb_id').style.left = - $('#progress_thumb_id').width()/2+'px';
	document.getElementById('progress_bar_id').style.width = 0+'px';
	clip_time_played_ms = 0;
	$(".time_passed").html("0:00");
	//May want to update the end time as well.
	$(".time_length").html("");

}

MixTape.setCurrentBookmark = function(selectedBookmarkId, forcePlay){
	var bookmarkData = bookmarksDB.find({_id:selectedBookmarkId}).fetch()[0];
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
		document.getElementById('progress_thumb_id').style.left = (offset*progress_percent- $('#progress_thumb_id').width()/2)+'px';
		document.getElementById('progress_bar_id').style.width = (offset*progress_percent)+'px';

		document.getElementById('bookmark_time_start').style.left = (offset*progress_percent - $('#progress_thumb_id').width()/2 - 6)+'px';
		document.getElementById('bookmark_marker_start').style.left = (offset*progress_percent - $('#progress_thumb_id').width()/2 + 1) +'px';

		progress_percent = bookmarkEnd/clip_time_length_ms;

		document.getElementById('bookmark_time_end').style.left = (offset*progress_percent - $('#progress_thumb_id').width()/2 - 6)+'px';
		document.getElementById('bookmark_marker_end').style.left = (offset*progress_percent - $('#progress_thumb_id').width()/2 - 1)+'px';

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

//This is for when dragging after having pressed down on the track thumb.
MixTape.dragProgressElements = function(e){
	var currentClip = Session.get('CURRENT_CLIP_KEY');
	if (currentClip){
		if(dragging_thumb){
			MixTape.hoverTrack(e);
			console.log("I'm dragging");
			var new_pos = ''+(e.clientX-$('#track_id').offset().left);
			//console.log('new_pos: ' + new_pos);
			//console.log('offsetWidth: ' + document.getElementById('track_background_id').offsetWidth);
			var max_width = document.getElementById('track_background_id').offsetWidth;
			var currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
			if(currentBookmarkKey){
				var left_position = $('#bookmark_marker_start').position().left;
				var right_position = $('#bookmark_marker_end').position().left;

				if(new_pos < left_position){
					document.getElementById('progress_thumb_id').style.left = left_position- $('#progress_thumb_id').width()/2 +'px';
					document.getElementById('progress_bar_id').style.width = left_position +'px';
				} else if(new_pos > right_position){
					document.getElementById('progress_thumb_id').style.left = right_position- $('#progress_thumb_id').width()/2 +'px';
					document.getElementById('progress_bar_id').style.width = right_position +'px';
				} else {
					document.getElementById('progress_thumb_id').style.left = new_pos- $('#progress_thumb_id').width()/2+'px';
					document.getElementById('progress_bar_id').style.width = new_pos+'px';
				}

			} else{
				if(new_pos < 0){
					document.getElementById('progress_thumb_id').style.left = - $('#progress_thumb_id').width()/2+'px';
					document.getElementById('progress_bar_id').style.width = - $('#progress_thumb_id').width()/2+'px';
				} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
					document.getElementById('progress_thumb_id').style.left = document.getElementById('track_background_id').offsetWidth- $('#progress_thumb_id').width()/2+'px';
					document.getElementById('progress_bar_id').style.width = document.getElementById('track_background_id').offsetWidth+'px';
				} else {
					document.getElementById('progress_thumb_id').style.left = new_pos- $('#progress_thumb_id').width()/2+'px';
					document.getElementById('progress_bar_id').style.width = new_pos+'px';
				}
			}
			var current_width = document.getElementById('progress_bar_id').offsetWidth;
			var progress_percent = current_width/max_width;
			var clip_time_length_ms = Session.get('clip_duration');
			clip_time_played_ms = (clip_time_length_ms*progress_percent);
			clip_time_played_ms = Math.floor(clip_time_played_ms/1000)*1000;

			console.log(clip_time_played_ms);
			MixTape.updateTimePassed();
		}
	}
}


//Clears the help text from invalid bookmark time input
MixTape.clearHelpText = function(e){
	var target = e.target;
	var value = $(target).val();
	if(value == "Format 'mm:ss'" || "Double click clip!"){
		$(target).val('');
	}
}
//Update time_passed
MixTape.updateTimePassed = function(){
	var currentClip = Session.get('CURRENT_CLIP_KEY');
	if (currentClip){
		var minutes = Math.floor(clip_time_played_ms/(60*1000));
		var seconds = Math.floor(clip_time_played_ms/1000)%60;
		if(seconds < 10){
			$(".time_passed").html(""+minutes+":0"+seconds);
		}else{
			$(".time_passed").html(""+minutes+":"+seconds);
		}
	}
}

MixTape.resetProgressElements = function(){
	var currentBookmark = Session.get('CURRENT_BOOKMARK_KEY');

	if(currentBookmark){
		var bookmarkData = bookmarksDB.find({_id:currentBookmark}).fetch()[0];
		var bookmarkStart = bookmarkData.startTime;
		var leftPos = $('#bookmark_marker_start').position().left;
		document.getElementById('progress_thumb_id').style.left = leftPos - $('#progress_thumb_id').width()/2+'px';
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
	var offset = document.getElementById('track_background_id').offsetWidth;
	document.getElementById('progress_thumb_id').style.left = (offset * progress_percent - $('#progress_thumb_id').width()/2)+'px';
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
			var currentClip = clipsDB.find({_id:currentClipKey}).fetch()[0];
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

MixTape.clickTrack= function(e){
	var currentClipKey = Session.get('CURRENT_CLIP_KEY');
	if (currentClipKey){
		currentBookmarkKey = Session.get('CURRENT_BOOKMARK_KEY');
		var new_pos = ''+(e.clientX-$('#track_id').offset().left);
		var thumbContri = $('#progress_thumb_id').width()/2;
		if(currentBookmarkKey){
			
			var left_position = $('#bookmark_marker_start').position().left;
			var right_position = $('#bookmark_marker_end').position().left;

			if(new_pos < left_position){
				document.getElementById('progress_thumb_id').style.left = left_position - thumbContri +'px';
				document.getElementById('progress_bar_id').style.width = left_position +'px';
			} else if(new_pos > right_position){
				document.getElementById('progress_thumb_id').style.left = right_position - thumbContri +'px';
				document.getElementById('progress_bar_id').style.width = right_position +'px';
			} else {
				document.getElementById('progress_thumb_id').style.left = new_pos - thumbContri+'px';
				document.getElementById('progress_bar_id').style.width = new_pos+'px';
			}
			

		} else{

			if(new_pos < 0){
				document.getElementById('progress_thumb_id').style.left = - $('#progress_thumb_id').width()/2 +'px';
				document.getElementById('progress_bar_id').style.width = 0+'px';
			} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
				document.getElementById('progress_thumb_id').style.left = (document.getElementById('track_background_id').offsetWidth - thumbContri)+'px';
				document.getElementById('progress_bar_id').style.width = document.getElementById('track_background_id').offsetWidth+'px';
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

//Gabriel Modification. END

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



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




MixTape.isCssIdValid = function(id) {
    re = /^[A-Za-z]+[\w\-\:\.]*$/
    return re.test(id)
}

	// good places to look
	// http://www.jque.re/plugins/version3/bootstrap.switch/
	// http://www.bootstraptoggle.com/
	// http://www.bootply.com/92189 (Manage/Listen)
	// http://www.jonathanbriehl.com/2014/01/17/vertical-menu-for-bootstrap-3/ (Vertical Menu)
	// http://earmbrust.github.io/bootstrap-window/ (windows for menu/editing?)
	// http://startbootstrap.com/template-overviews/simple-sidebar/ (hidden menus)
	// http://www.prepbootstrap.com/bootstrap-template/collapsepanels (collapsible?)





// add to the menu a new item
// Needs to be modified!!
// MixTape.addItemToMenu = function(menu, item){
// 	var menuul = menu.children[0].children[1];
// 	var itemContainer = document.createElement('li');
// 	var itemText = document.createElement('div');
// 	var itemSubmenu = document.createElement('ul');
// 	var itemPlay = document.createElement('a');
// 	var itemEdit = document.createElement('a');
// 	var itemRemove = document.createElement('a');
// 	var itemPlayIconBefore = document.createElement('span');	
// 	var itemEditIcon = document.createElement('span');
// 	var itemPlayIcon = document.createElement('span');
// 	var itemRemoveIcon = document.createElement('span');
	

// 	if(item.name().split('-')[0] == 'url'){
// 		itemText.innerHTML = item.url;
// 	}
// 	else{
// 		itemText.innerHTML = item.name();
// 	}
// 	itemPlayIconBefore.setAttribute('class', "glyphicon glyphicon-play music-item-play-icon");
// 	itemContainer.setAttribute('class', "list-group-item" + " " + item.type);
// 	itemSubmenu.setAttribute('class', "list-group-submenu");

// 	// itemEdit.setAttribute('data-backdrop','false');
// 	// itemEdit.setAttribute('data-toggle','modal');
// 	itemEdit.setAttribute('class', "list-group-submenu-item edit primary btn btn-default");
// 	itemPlay.setAttribute('class', "list-group-submenu-item play info btn btn-default");
// 	itemRemove.setAttribute('class', "list-group-submenu-item trash danger btn btn-default");
// 	itemEditIcon.setAttribute('class', "glyphicon glyphicon-pencil");
// 	itemPlayIcon.setAttribute('class', "glyphicon glyphicon-play");
// 	itemRemoveIcon.setAttribute('class', "glyphicon glyphicon-trash");
	

// 	$(itemRemove).click(function(e) {
// 		e.stopPropagation();	
// 		var selection = $(e.currentTarget.offsetParent.offsetParent);
// 		var removalMenu = menuul;
// 		var removalIndex = selection.index();
// 		var removalType = MixTape.getBackEndItem(selection[0]).type;
// 		var removalName = MixTape.getBackEndItem(selection[0]).name;
		
// 		var confirmationMessage;

// 		bootbox.confirm("Are you sure you want to remove " +  removalType + " " + removalName + "?", function(result) {
//   			if (result){
//   				MixTape.removeItemFromMenu(removalMenu,selection,removalIndex);
//   			}
// 		});

// 		console.log('In remove');

// 	});


// 	$(itemPlayIconBefore).click(function(e) {
// 		// var name = ($(this).text()).trim();
// 		console.log('In play');
// 		var playClip = ($(this).parent().parent());
// 		MixTape.deactivate(playClip[0]);
// 		MixTape.makeActive(playClip[0]);
// 		if(!playClip.hasClass('bookmark')) {
// 			MixTape.setCurrentBookmark(-1);
// 			MixTape.updateMenus();
// 		}
// 		else{
// 			e.stopPropagation();
// 		}
// 		MixTape.setCurrentClipPlayer();
// 		if (waitForMetadata){
// 			checkMetadata = setInterval(function () {MixTape.playWhenMetadataLoaded(e)}, 250);
// 		}else{
// 			MixTape.togglePlay(e);
// 		}		
		
// 	});

// 	itemRemove.appendChild(itemRemoveIcon);

// 	itemEdit.appendChild(itemEditIcon);
// 	MixTape.addBookmarkEditorFunctionality($(itemEdit))

// 	itemPlay.appendChild(itemPlayIcon);

// 	itemSubmenu.appendChild(itemEdit);
// 	itemSubmenu.appendChild(itemPlay);
// 	itemSubmenu.appendChild(itemRemove);

//  	itemText.insertBefore(itemPlayIconBefore,itemText.childNodes[0]);
// 	itemContainer.appendChild(itemText);



// 	$(itemContainer).hover(function(e){
// 		$(itemText).children( "span" ).css( "visibility", "visible");
// 	}, function(e) {
//     $(itemText).children( "span" ).css( "visibility", "hidden");
//   });

// 	itemContainer.appendChild(itemSubmenu);

// 	var tag = menu.id + '-' + item.id();
// 		// console.log(item);
// 		// console.log(item.id());
// 		if(item.dbId){
// 			tag = item.id();
// 		}
// 		else{
// 			item.setId(tag);
// 		}
		
// 		// console.log(item.id());
// 		// console.log(tag);

// 	itemContainer.setAttribute('id', tag);
	
// 	var clicks = 0, timeOut = 200;
// 	$(itemContainer).bind('click', function(e) {
// 		console.log("Click!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
// 		clicks++;
// 		if(!$(this).hasClass('active')){
// 			MixTape.deactivate(this);
// 			MixTape.makeActive(this);
// 			setTimeout(function() {
// 		      if (clicks == 1){
// 		      	MixTape.updateMenus();
// 		      }      
// 			}, timeOut);
// 		}	

// 	});

// 	$(itemContainer).bind('dblclick', function(e) {
// 		//isLoadingMetadata = true;
// 		//console.log("isLoadingMetadata set to true!");
// 		console.log('Before Setting the current Clip')
// 		MixTape.setCurrentClipPlayer();
// 		MixTape.updateMenus();
// 		document.getElementById('inputStartTime').value = '';
//         document.getElementById('inputEndTime').value = '';
// 		clicks = 0;
// 		console.log('doubleclick on item');
// 	});


	
// 	menuul.appendChild(itemContainer);

// 	var currentItem;
// 	if (item.type == 'playlist') currentItem = currentPlaylist;
// 	else if (item.type == 'clip') currentItem = currentClip;
// 	else if (item.type == 'bookmark') currentItem = currentBookmark;
	
// 	if (currentItem){
// 		if (item.dbId == currentItem.dbId){
// 			$('#' + itemContainer.id).addClass('active');
// 			if (item.type == 'bookmark') $('#' + itemContainer.id).click(MixTape.deselect);
// 		}
// 	}

// 	// // change it to active if the active current clip or playlist
// 	// if (item == currentPlaylist){
// 	// 	$('#' + itemContainer.id).addClass('active');
// 	// }
// 	// else if (item == currentClip){
// 	// 	console.log('Getting to set active.........!');
// 	// 	$('#' + itemContainer.id).addClass('active');
// 	// }
// 	// else if (item == currentBookmark){
// 	// 	$('#' + itemContainer.id).addClass('active');
// 	// 	$('#' + itemContainer.id).click(MixTape.deselect);
// 	// }
// }

