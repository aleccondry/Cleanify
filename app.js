const http = require('http');
var fs = require('fs');
var express = require('express');
var request = require('request');
const ejs = require('ejs');
var url = require('url');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var app = express();

var client_id = '366e8b5ceafa4a548f5be611eaffe8ab'; // Your client id
var client_secret = process.env.ClientSecret; // Your secret
var redirect_uri = 'http://localhost:8080/'; // Your redirect uri

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});

var scopes = ['user-read-private', 'user-read-email'],
  redirectUri,
  clientId,
  storedState = Math.random().toString(36).substring(2, 15);


//create authorization url
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, storedState);

fs.writeFileSync("pass.json", 'var package = {"authorizeURL":"'+authorizeURL+'"}', 'utf-8');

console.log(fs.readFileSync("pass.json").toString());
console.log(authorizeURL);

// app.use(express.static(__dirname + '/public'))
//    .use(cors())
//    .use(cookieParser());

app.configure(function () {
app.use(express.bodyParser());
app.use(express.cookieParser());
// app.use(express.session({
//     store: sessionStore,
//     secret: 'secret',
//     key: 'express.sid'
// }));
app.use(app.router); //Now router comes first and will be executed before static middleware
app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
  console.log("L");
  res.send("hello world");
  // your application requests refresh and access tokens
  // after checking the state parameter

  // var code = req.query.code || null;
  // var state = req.query.state || null;
  //
  // if (state === null || state !== storedState) {
  //   res.redirect('/#' +
  //     querystring.stringify({
  //       error: 'state_mismatch'
  //     }));
  // } else {
  //   var authOptions = {
  //     url: 'https://accounts.spotify.com/api/token',
  //     form: {
  //       code: code,
  //       redirect_uri: redirect_uri,
  //       grant_type: 'authorization_code'
  //     },
  //     headers: {
  //       'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  //     },
  //     json: true
  //   };
  //
  //   request.post(authOptions, function(error, response, body) {
  //     if (!error && response.statusCode === 200) {
  //
  //       var access_token = body.access_token,
  //           refresh_token = body.refresh_token;
  //
  //       var options = {
  //         url: 'https://api.spotify.com/v1/me',
  //         headers: { 'Authorization': 'Bearer ' + access_token },
  //         json: true
  //       };
  //
  //       // use the access token to access the Spotify Web API
  //       request.get(options, function(error, response, body) {
  //         console.log(body);
  //       });
  //
  //       // we can also pass the token to the browser to make requests from there
  //       res.redirect('/#' +
  //         querystring.stringify({
  //           access_token: access_token,
  //           refresh_token: refresh_token
  //         }));
  //     } else {
  //       res.redirect('/#' +
  //         querystring.stringify({
  //           error: 'invalid_token'
  //         }));
  //     }
  //   });
  // }
});

var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
    
});
