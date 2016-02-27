Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'main',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [ 
      Meteor.subscribe('playlists'), 
      Meteor.subscribe('clips'), 
      Meteor.subscribe('bookmarks') 
    ];
  }
});

// Router.route('/', {
//     template: 'mixtape',
//     waitOn: function(){
        
//     }
// });


dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  // dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  // Router.onBeforeAction('loading', {except: ['join', 'signin']});
  // Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
  Router.onBeforeAction(function () {
  // all properties available in the route function
  // are also available here such as this.params
    if (!Meteor.userId()) {
      // if the user is not logged in, render the Login template
      this.render('signin');
    } else {
      // otherwise don't hold up the rest of hooks or our route/action function
      // from running
      this.next();
    }
  },{except: ['join']});
}

Router.route('join');
Router.route('signin');

Router.route('home', {
  path: '/',
  template: 'mixtape',
});


