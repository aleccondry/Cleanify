//TODO: FIX CONCURRENT USER ISSUES - take in user id in get requests (must send somehow during authorization)

// IMPORTS
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request');
const express = require('express');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');

// GLOBALS
var app = express();
var client_id = '366e8b5ceafa4a548f5be611eaffe8ab'; // Your client id
var client_secret = fs.readFileSync("env.txt").toString().trim();
var redirect_uri = 'http://cleanify.mooo.com/callback'; // Your redirect uri
var refresh_token = null;

// Initialize the API Wrapper
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});

// Create authorization url
var scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-collaborative'
];
var storedState = Math.random().toString(36).substring(2, 15);
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, storedState);

// Some debugging info
console.log("Secret: " + client_secret); // Your secret
fs.writeFileSync("public/pass.json", 'var package = {"authorizeURL":"'+authorizeURL+'"}', 'utf-8');
console.log(fs.readFileSync("public/pass.json").toString());
console.log(authorizeURL);

// Serve up all html
app.use(express.static('public'))

// Default route (send index.html)
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
  console.log("home accessed");


});

// Callback route (redirect for API)
app.get('/callback', function(req, res){
  var authOptions;
  console.log(req.url)
  var code = req.query.code || null;
  // var storedState = req.state;
  var state = req.query.state || null;
  console.log("State: " + state + "; Storedstate: " + storedState);
  if (state !== storedState || state === null) {
    res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
  } else {
    authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri/*,
        client_id: client_id,
        client_secret: client_secret*/
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      json: true
    };
  }
  console.log('url: ' + authOptions.url);
  console.log('grant_type: ' + authOptions.form.grant_type);
  console.log('Authorization code: ' + authOptions.form.code);
  console.log('redirect_uri: ' + authOptions.form.redirect_uri);
  console.log('headers: ' + authOptions.headers.Authorization);

  // Get the authorization access token
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      console.log('WE MADE IT!');

      // Send it to  the userpage
  //    res.redirect('/userpage');
        if (spotifyApi.getAccessToken()) {
            res.redirect('/userpage.html?u='+spotifyApi.getAccessToken())
          } else {
            console.log("Didn't work mamma mia" + spotifyApi.getAccessToken())
            res.redirect('/')
          }
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
  );
});


app.get('/playlists', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
  console.log("getting playlists")
  spotifyApi.getMe().then(function(data){
    var id = data.body.id;
    spotifyApi.getUserPlaylists(id).then(function(data){
      res.json(data.body);
      console.log("yeeted it over")
    }, function(err){console.log("Did not yeet", err);}).catch(function(){console.log("promise rejected");});
  }, function(err){console.log("failed to get user id", err);}).catch(function(){console.log("getMe promise rejected");});
});

//HTTP Request Methods
app.get('/search', function(req, res){
    var name = req.query.name;
    var artist = req.query.artist;
    //search for clean version
    spotifyApi.searchTracks('track:' + name + ' artist:' + artist).then(function(data){
      var searchedTracks = data.body.tracks;
      res.json(searchedTracks);//send search results to front end for processing
    })
})

app.get('/create', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
    var name = req.query.name;
    spotifyApi.getMe().then(function(data){
      var id = data.body.id;
      console.log("ID: ", id);
      spotifyApi.createPlaylist(id, name, {"public":false}).then(function(data){
        var playlistID = data.body;
        res.json(data.body);
      }, function(err){console.log("Couldn't create playlist", err)});
    }, function(err){console.log('Something went wrong!', err);})
})

app.get('/addtrack', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
    var playlistID = req.query.playlistid;
    var trackID = req.query.trackid;
    spotifyApi.addTracksToPlaylist(playlistID, ["spotify:track:"+trackID]).then(function(data){
      res.json(data.body);
    }, function(err){console.log("couldn't add tracks", err)});
});

app.get('/playlist', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
    var id = req.query.id;
    spotifyApi.getPlaylist(id).then(function(data){
      res.json(data.body);
    },function(err){console.log(err)});
});

app.get('/tracks', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
    var offset = req.query.offset;
    var id = req.query.id;
    spotifyApi.getPlaylistTracks(id, {"offset": offset}).then(function(data){
      res.json(data.body);
    }, function(err){console.log("couldn't get tracks", err)});
});

app.get('/remove', function(req, res){
  var access = req.query.u;
  spotifyApi.setAccessToken(access);
  var id = req.query.id;
  spotifyApi.unfollowPlaylist(id).then(function(data){console.log("successfully deleted")},
      function(err){console.log("could not delete", err)});
})


app.listen(3000);
