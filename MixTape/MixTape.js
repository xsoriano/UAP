playlistsDB = new Mongo.Collection('playlists');
clipsDB = new Mongo.Collection('clips');
bookmarksDB = new Mongo.Collection('bookmarks');

hi = function(){
  console.log("hello world!");
}


if (Meteor.isServer) {
  Meteor.publish('playlistsDB', function(){
    return playlistsDB.find({}); // publish the posts collection
  });

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

