const http = require('http');
var fs = require('fs');

var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const express = require('express');
var app = express();
const path = require('path');


var client_id = '366e8b5ceafa4a548f5be611eaffe8ab'; // Your client id
var client_secret = process.env.ClientSecret; // Your secret
var redirect_uri = 'http://localhost:8080/callback'; // Your redirect uri

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

fs.writeFileSync("public/pass.json", 'var package = {"authorizeURL":"'+authorizeURL+'"}', 'utf-8');

console.log(fs.readFileSync("public/pass.json").toString());
console.log(authorizeURL);

app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
  console.log("sent");
})
// app.use(express.static(__dirname));
app.get('/callback', function(req, res){
  console.log("l");
  var code = req.query.code || null;
  // var storedState = req.state;
  var state = req.query.state || null;
  console.log("State: " + state + "; Storedstate: " + storedState);
  if (state !== storedState || state === null) {
    res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      JSON: true
    };
    }
  }
)

app.listen(8080);
// var connect = require('connect');
// var serveStatic = require('serve-static');
// connect().use(serveStatic(__dirname)).listen(8080, function(){
//     console.log('Server running on 3000...');
// });
