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
var scopes = ['user-read-private', 'user-read-email'];
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
      res.redirect('/userpage.html');
    },
    function(err) {
      console.log('Something went wrong!', err);
    }
  );
});

app.get('/userpage.html', function(res, req){
  if (spotifyApi.getAccessToken()) {
    spotifyApi.getMe()
    .then(function(data) {
      console.log('Some information about the authenticated user', data.body);
    }, function(err) {
      console.log('Something went wrong!', err);
    });
  } else {
    console.log("Didn't work mamma mia" + spotifyApi.getAccessToken())
    res.redirect('/')
  }

})

app.listen(3000);
