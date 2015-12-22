// everything that deals mostly with the player dialog is in here

//Gabriel Modification. START

noClips = true; //variable to track if we're in start state

//Change by Xavier
waitForMetadata = false;
currentSrc = null;
//End change by Xavier
playingClip = null;

$(document).ready(function() {
    //Gabriel Modifications. START
    var music_clip_window = document.getElementById('music-clip-window');
    var progress_bar = document.getElementById('progress_bar_id');
    var track = document.getElementById('track_id');
    var progress_thumb = document.getElementById('progress_thumb_id');
    var bookmark_btn = document.getElementById('btnBookmark');
    var input_start_time = document.getElementById('inputStartTime');
    var input_end_time = document.getElementById('inputEndTime');

    input_start_time.addEventListener("focus", MixTape.clearHelpText);
    input_end_time.addEventListener("focus", MixTape.clearHelpText);
    bookmark_btn.addEventListener('click', MixTape.addNewBookmark);

    progress_thumb.addEventListener('mousedown', MixTape.startDragging);
    document.addEventListener('mouseup', MixTape.endDragging);
    track.addEventListener('click', MixTape.clickTrack);
    progress_bar.addEventListener('click', MixTape.clickTrack);

    track.addEventListener('mousemove', MixTape.hoverTrack);
    progress_bar.addEventListener('mousemove', MixTape.hoverTrack);
    track.addEventListener('mouseout', MixTape.unHover);
    progress_bar.addEventListener('mouseout', MixTape.unHover);


    var btnPlay = document.getElementById('btnPlay');
    btnPlay.addEventListener('click', MixTape.togglePlay);

    var clip = document.getElementById('current-clip');
    clip.loop = false;
    
    clip.addEventListener('loadedmetadata', function() {
    	console.log('loaded meta data!');

    	clip_time_length_ms = document.getElementById('current-clip').duration*1000;
    	console.log(clip_time_length_ms);
    	var minutes = Math.floor(clip_time_length_ms/(1000*60));
    	var seconds = Math.floor(clip_time_length_ms/1000)%60;

    	// no time value shows if no clip available
    	if (noClips == true){
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

    	//Gabriel Modification of my own modification
    	//This is meant to replace part of the'setCurrentClipPlayer' function.
		console.log(playing_clip);
		if(playing_clip){
    		MixTape.togglePlay();
    	}
    	MixTape.resetProgressElements();
    	//End

    	//change by Xavier
    	if (waitForMetadata){
    		waitForMetadata = false
    	}
    	//End change by Xavier

    	// to make the editing window show the name of the clip
    	if (currentClip){
	    	$("#track-name-container").html("<a>"+ currentClip.name() + "</a>");
	    	basicBehavior.centerTrackName();
    	}

    	$(input_end_time).val("");
    	$(input_start_time).val("");

    	playingClip = currentClip;
    	//Gabrielj. Testing something.
    	// MixTape.setCurrentBookmark(-1);
    	if (currentBookmark != null){
    		console.log(currentBookmark);
    		console.log(currentClip);
    		console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    		console.log(currentBookmark.belongsToClip(currentClip));

    		if(!currentBookmark.belongsToClip(currentClip)){
    			MixTape.setCurrentBookmark(-1);
    		}else{
    			MixTape.setCurrentBookmark(currentBookmarkIndex);
    		}
    	} else{
    		console.log("11$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    		MixTape.adjustBookmarkMarkers();
    		MixTape.resetProgressElements();
    	}	

    	//isLoadingMetadata = false;

    });
	//Gabriel Modifications. END

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

//Author: Gabrielj. Called in setCurrentBookmark. Meant to adjust the bookmark markers and the displayed times accordingly.
MixTape.adjustBookmarkMarkers= function(){
	if(currentBookmark != null){
		//Assumption that times are valid. The check happens in addNewBookmark.
		bookmark_time_start = currentBookmark.startTime();
		bookmark_time_end = currentBookmark.endTime();
		clip_time_played_ms = bookmark_time_start;
		var clip = document.getElementById('current-clip');

		clip.currentTime = Math.floor(clip_time_played_ms/1000);

		//Changung HTML
		var start_minutes = Math.floor(bookmark_time_start/(60*1000));
		var start_seconds = Math.floor(bookmark_time_start/1000)%60;
		if(start_seconds < 10){
			$("#bookmark_time_start").html(""+start_minutes+":0"+start_seconds);
		}else{
			$("#bookmark_time_start").html(""+start_minutes+":"+start_seconds);
		}

		var end_minutes = Math.floor(bookmark_time_end/(60*1000));
		var end_seconds = Math.floor(bookmark_time_end/1000)%60;
		if(end_seconds < 10){
			$("#bookmark_time_end").html(""+end_minutes+":0"+end_seconds);
		}else{
			$("#bookmark_time_end").html(""+end_minutes+":"+end_seconds);
		}

		//Changing position
		var progress_percent = bookmark_time_start/clip_time_length_ms;
		
		document.getElementById('progress_thumb_id').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent)+'px';
		document.getElementById('progress_bar_id').style.width = (document.getElementById('track_background_id').offsetWidth*progress_percent)+'px';

		document.getElementById('bookmark_time_start').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent - 6)+'px';
		document.getElementById('bookmark_marker_start').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent + 1) +'px';

		progress_percent = bookmark_time_end/clip_time_length_ms;

		document.getElementById('bookmark_time_end').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent - 6)+'px';
		document.getElementById('bookmark_marker_end').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent + 1)+'px';

		document.getElementById('bookmark_marker_start').style.visibility = 'visible';
		document.getElementById('bookmark_marker_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_end').style.visibility = 'visible';
		document.getElementById('bookmark_time_start').style.visibility = 'visible';



	} else{
		document.getElementById('bookmark_marker_start').style.visibility = 'hidden';
		document.getElementById('bookmark_marker_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_end').style.visibility = 'hidden';
		document.getElementById('bookmark_time_start').style.visibility = 'hidden';
		if(playing_clip){
			MixTape.togglePlay();
		}
		//Gabrielj. Changes to behavior. Now getting rid of bookmark resets progress elements
		MixTape.resetProgressElements();
	}

	MixTape.updateTimePassed();
}

//Sets the variable 'dragging_thumb' to true
MixTape.startDragging= function(e){
	/*
        var parent_pos = $('#content').position();
        var cursor_x = e.clientX-parent_pos.left;
        var cursor_y = e.clientY-parent_pos.top;
        var square_length = 400/board.boardSize;
        var col = Math.floor(cursor_x/square_length);
        var row = Math.floor(cursor_y/square_length);
        //console.log("Col: " + col);
        //console.log("Row: " + row);
        checker_dragged = board.getCheckerAt(row, col);

        img_dragged = document.getElementById(e.target.id);
        //Above the arrows
        img_dragged.style.zIndex = "35";
        */
        dragging_thumb = true;
        console.log("Start dragging");
    }

//Sets the variable 'dragging_thumb' to false
MixTape.endDragging= function(e){
	if(dragging_thumb){
		dragging_thumb = false;
		var clip = document.getElementById('current-clip');
		clip.currentTime = Math.floor(clip_time_played_ms/1000);
//<<<<<<< HEAD
		//clip.play();
		/*
=======
		if (playing_clip == true){	
			clip.play();
		}
>>>>>>> 38fab7b1590a33d57c6ec0e234d02f292b8cfedb
*/
console.log("End dragging");
}
}

//This is for when dragging after having pressed down on the track thumb.
MixTape.dragProgressElements= function(e){
	if (noClips == false){
		if(dragging_thumb){
			//console.log("I'm dragging");
			//var parent_pos = $('#music-clip-window').position();
			var parent_pos = $('#music-clip-column').position();
			var new_pos = ''+(e.clientX-parent_pos.left-17);
			//console.log('new_pos: ' + new_pos);
			//console.log('offsetWidth: ' + document.getElementById('track_background_id').offsetWidth);
			var max_width = document.getElementById('track_background_id').offsetWidth;
			if(is_bookmark_selected){
				var left_position = $('#bookmark_marker_start').position().left;
				var right_position = $('#bookmark_marker_end').position().left;

				if(new_pos < left_position){
					document.getElementById('progress_thumb_id').style.left = left_position +'px';
					document.getElementById('progress_bar_id').style.width = left_position +'px';
				} else if(new_pos > right_position){
					document.getElementById('progress_thumb_id').style.left = right_position +'px';
					document.getElementById('progress_bar_id').style.width = right_position +'px';
				} else {
					document.getElementById('progress_thumb_id').style.left = new_pos+'px';
					document.getElementById('progress_bar_id').style.width = new_pos+'px';
				}

			} else{
				if(new_pos < 0){
					document.getElementById('progress_thumb_id').style.left = 0+'px';
					document.getElementById('progress_bar_id').style.width = 0+'px';
				} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
					document.getElementById('progress_thumb_id').style.left = document.getElementById('track_background_id').offsetWidth+'px';
					document.getElementById('progress_bar_id').style.width = document.getElementById('track_background_id').offsetWidth+'px';
				} else {
					document.getElementById('progress_thumb_id').style.left = new_pos+'px';
					document.getElementById('progress_bar_id').style.width = new_pos+'px';
				}
			}
			var current_width = document.getElementById('progress_bar_id').offsetWidth;
			var progress_percent = current_width/max_width;
			clip_time_played_ms = (clip_time_length_ms*progress_percent);
			clip_time_played_ms = Math.floor(clip_time_played_ms/1000)*1000;

			console.log(clip_time_played_ms);
			MixTape.updateTimePassed();
		}
	}
}
/*
//CLick event for bookmark menu
{
	clip_time_played_ms = currentBookmark.startTime;
	updateTimePassed();
	document.getElementById('current-clip').currentTime = Math.floor(clip_time_played_ms/1000);
}
*/

//Clears the help text from invalid bookmark time input
MixTape.clearHelpText= function(e){
	var target = e.target;
	var value = $(target).val();
	if(value == "Format 'mm:ss'" || "Double click clip!"){
		$(target).val('');
	}
}
//Update time_passed
MixTape.updateTimePassed= function(){
	if (noClips == false){
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
	if(is_bookmark_selected){
		var left_position = $('#bookmark_marker_start').position().left;
		document.getElementById('progress_thumb_id').style.left = left_position+'px';
		document.getElementById('progress_bar_id').style.width = left_position+'px';
		clip_time_played_ms = bookmark_time_start;
		var clip = document.getElementById('current-clip');
		clip.currentTime = Math.floor(clip_time_played_ms/1000);
	} else{
		document.getElementById('progress_thumb_id').style.left = 0+'px';
		document.getElementById('progress_bar_id').style.width = 0+'px';
		clip_time_played_ms = 0;
	}
	MixTape.updateTimePassed();
}

MixTape.adjustProgressElements= function(){
	var progress_percent = clip_time_played_ms/clip_time_length_ms;
	//console.log('Percent played: ' + progress_percent);
	document.getElementById('progress_thumb_id').style.left = (document.getElementById('track_background_id').offsetWidth*progress_percent)+'px';
	document.getElementById('progress_bar_id').style.width = (document.getElementById('track_background_id').offsetWidth*progress_percent)+'px';

	MixTape.updateTimePassed();

}

//Toggles between playing the selected clip.
MixTape.togglePlay= function(e){
	// for start state
	if (noClips == false){

		$('#btnPlay_icon').toggleClass('glyphicon-play');
		$('#btnPlay_icon').toggleClass('glyphicon-pause');
		if(playing_clip){
			playing_clip = false;
			clearInterval(interval_function);
			var clip = document.getElementById('current-clip');
			clip.pause();
			console.log('Stopped Playing');
		} else {
			playing_clip = true;
			interval_function = setInterval(function () {MixTape.trackTimer()}, 250);
			var clip = document.getElementById('current-clip');
			console.log('in toggle play play', clip.currentTime);
			clip.play();
			console.log('Started Playing');
		}
	}
}

MixTape.trackTimer= function() {
	if(is_bookmark_selected){
		if(clip_time_played_ms >= bookmark_time_end){
			MixTape.togglePlay();
			clearInterval(interval_function);
			MixTape.resetProgressElements();
			//console.log('clip time played',clip_time_played_ms, 'trackTimer()')
		} else{
			clip_time_played_ms += 250;
			MixTape.adjustProgressElements();
		}
	} else{
		// Change by Xavier
		// added condition that if the currentSrc becomes null, then the track player should stop moving.
		if(clip_time_played_ms >= clip_time_length_ms || currentSrc == null){
			MixTape.togglePlay();
			clearInterval(interval_function);
			MixTape.resetProgressElements();
			//console.log('clip time played',clip_time_played_ms, 'trackTimer()')
		} else{
			clip_time_played_ms += 250;
			MixTape.adjustProgressElements();
		}
	//console.log('Time played in ms: ' + clip_time_played_ms);
	}

}

MixTape.clickTrack= function(e){
	if (noClips == false){
		if(is_bookmark_selected){
			var parent_pos = $('#music-clip-column').position();
			var new_pos = ''+(e.clientX-parent_pos.left-17);

			if(is_bookmark_selected){
				var left_position = $('#bookmark_marker_start').position().left;
				var right_position = $('#bookmark_marker_end').position().left;

				if(new_pos < left_position){
					document.getElementById('progress_thumb_id').style.left = left_position +'px';
					document.getElementById('progress_bar_id').style.width = left_position +'px';
				} else if(new_pos > right_position){
					document.getElementById('progress_thumb_id').style.left = right_position +'px';
					document.getElementById('progress_bar_id').style.width = right_position +'px';
				} else {
					document.getElementById('progress_thumb_id').style.left = new_pos+'px';
					document.getElementById('progress_bar_id').style.width = new_pos+'px';
				}
			}

		} else{
			var parent_pos = $('#music-clip-column').position();
			var new_pos = ''+(e.clientX-parent_pos.left-17);
			//console.log('new_pos: ' + new_pos);
			//console.log('offsetWidth: ' + document.getElementById('track_background_id').offsetWidth);
			if(new_pos < 0){
				document.getElementById('progress_thumb_id').style.left = 0+'px';
				document.getElementById('progress_bar_id').style.width = 0+'px';
			} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
				document.getElementById('progress_thumb_id').style.left = document.getElementById('track_background_id').offsetWidth+'px';
				document.getElementById('progress_bar_id').style.width = document.getElementById('track_background_id').offsetWidth+'px';
			} else {
				document.getElementById('progress_thumb_id').style.left = new_pos+'px';
				document.getElementById('progress_bar_id').style.width = new_pos+'px';
			}
		}

		var current_width = document.getElementById('progress_bar_id').offsetWidth;
		var max_width = document.getElementById('track_background_id').offsetWidth;
		var progress_percent = current_width/max_width;
		clip_time_played_ms = (clip_time_length_ms*progress_percent);
		clip_time_played_ms = Math.floor(clip_time_played_ms/1000)*1000;
		
		MixTape.updateTimePassed();

		var clip = document.getElementById('current-clip');
		clip.currentTime = Math.floor(clip_time_played_ms/1000);
		// autoplay
		if (playing_clip == true){
			clip.play();
		}
	}
}

//Gabriel Modification. END


MixTape.setCurrentClipPlayer = function(){

//<<<<<<< HEAD
console.log('Setting current clip player');

	//document.getElementById('current-clip').src = currentClip.src;
//=======
	// use this to keep from appearing as though playing a clip 
	// when there are no clips
	var currentClip = Session.get(CURRENT_CLIP_KEY);
	var sourceToPlay = clipsDB.find({_id:currentClip}).fetch()[0].source;
	if (noClips == true){
		noClips = false;
	}

	if (currentClip == null){
		
		// some gunky coding to reset and get quiet if no clip available to play
		document.getElementById('current-clip').src = document.getElementById('current-clip').src;
		noClips = true;
		//Change made by Xavier
		currentSrc = null;
		//selectedPlaylist = null;
		//End of change by Xavier
	} else {
		document.getElementById('current-clip').src = sourceToPlay;
		//Change made by Xavier
		waitForMetadata = true;
		currentSrc = sourceToPlay;
		//selectedPlaylist = currentClip.playlist();

		//End of change by Xavier
	}

	

//>>>>>>> 38fab7b1590a33d57c6ec0e234d02f292b8cfedb
/*
	resetProgressElements();

	if (playing_clip == true){
		// then the pause icon is showing, make it play iconf
		$('#btnPlay_icon').toggleClass('glyphicon-play');
		$('#btnPlay_icon').toggleClass('glyphicon-pause');
	}
	
	playing_clip = false;
	clearInterval(interval_function);
	var clip = document.getElementById('current-clip');
	*/

}

MixTape.hoverTrack= function(e){
	if (noClips == false){
		var parent_pos = $('#music-clip-column').position();
		var new_pos = ''+(e.clientX-parent_pos.left-17);
		var max_width = document.getElementById('track_background_id').offsetWidth;
		if(new_pos < 0){
			//document.getElementById('progress_thumb_id').style.left = 0+'px';
			//document.getElementById('progress_bar_id').style.width = 0+'px';
		} else if(new_pos > document.getElementById('track_background_id').offsetWidth){
			document.getElementById('hover_time_id').style.left = document.getElementById('track_background_id').offsetWidth+'px';
		} else {
			document.getElementById('hover_time_id').style.left = new_pos+'px';
		}
		var current_left = $('#hover_time_id').position().left;
		var progress_percent = current_left/max_width;
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
