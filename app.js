const http = require('http');
const port = 3000;

const Spotify = require('spotify-web-api-node');

// const requestHandler = (request, response) => {
//   console.log(request.url);
//   response.end('Hello Node.js Server!');
//
// }

// const server = http.createServer(requestHandler);
// server.listen(port, (err) => {
//   if (err) {
//     return console.log('something bad happened', err);
//   }
//
//   console.log(`server is listening on ${port}`);
// })

var spotify = new Spotify();

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});
