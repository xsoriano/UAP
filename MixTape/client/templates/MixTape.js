MixTape = function() {};



Template.mixtape.onRendered(function(){
  setSectionHeights();
});


function setSectionHeights(){
  var sectionHeight = $("html").height() - $("#player-container").height() - $("#navbar").height() + $("#player-container").outerHeight( true ) + "px";
  $('.music-section').css("height", sectionHeight);
}


if (Meteor.isServer) {
  // Meteor.publish('playlistsDB', function(){
  //   return playlistsDB.find({}); // publish the posts collection
  // });

  Meteor.startup(function() {

    return Meteor.methods({

      removeAllPlaylists: function() {

        return playlistsDB.remove({});

      },

      removePlaylist: function() {

        return playlistsDB.remove({sortOrder:{$gt: 3}});

      },

      removeAllClips: function() {

        return clipsDB.remove({});

      },

      removeAllBookmarks: function() {

        return bookmarksDB.remove({});

      },

      removeAllMusic: function() {

        removeAllPlaylists();
        removeAllClips();
        removeAllBookmarks();

      }

    });

  });

}

