var Spotify = require('node-spotify-api');
var moment = require('moment');
var request = require("request");
const dotenv = require("dotenv").config();
var fs = require('fs');
const keys = require("./keys");
var spotify = new Spotify(keys.spotify);
const bandsInTown = keys.bandsInTown;
const OMDB = keys.OMDB;

if (process.argv[2]) {
  let selection = process.argv[2];
  if (process.argv[3]) {
    process.argv.shift();
    process.argv.shift();
    process.argv.shift();
    var queryString = process.argv.join(' ');
  }
  selectOperation(selection, queryString);

} else logResults('no arguments supplied');

function searchBandsInTown(artist) {
  if (!artist) artist = 'Third Eye Blind';
  request(`https://rest.bandsintown.com/artists/${encodeURI(artist)}/events?app_id=codingbootcamp`,
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        body = JSON.parse(body);
        logResults(`Results for ${artist}`);

        for (let i = 0; i < body.length; i++) {
          let time = moment(body[i].datetime).format('MM/DD/YYYY');
          logResults(`Venue: ${body[i].venue.name}`);
          logResults(`Location: ${body[i].venue.city}, ${body[i].venue.region}, ${body[i].venue.country}`);
          logResults(`Date: ${time}`)
        }
      }
    });
}
function selectOperation(selection, queryString) {
  if (selection === 'concert-this') {
    searchBandsInTown(queryString);
  } else if (selection === 'spotify-this-song') {
    searchSpotify(queryString);
  } else if (selection === 'movie-this') {
    searchOMDB(queryString);
  } else if (selection === 'do-what-it-says') {
    //import random.txt split on comma then call searchSpotifywith second element
    fs.readFile('random.txt', 'utf8', function (err, data) {
      if (err) throw err;
      let stuff = data.split(',');
      let test = stuff[1].substring(stuff[1].indexOf('"') + 1, stuff[1].lastIndexOf('"'));
      selectOperation(stuff[0], test);
    });
  }
}
function searchOMDB(movie) {
  if (!movie) movie = 'Mr. Nobody';
  request(`http://www.omdbapi.com/?t=${encodeURI(movie)}&y=&plot=short&apikey=${OMDB.id}`,
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        body = JSON.parse(body);
        let rtRating = "Not Available";
        logResults(`Title: ${body.Title}`);
        logResults(`Release Year: ${body.Year}`);
        logResults(`IMDB Rating: ${body.imdbRating}`);
        for (let i = 0; i < body.Ratings.length; i++) {
          if (body.Ratings[i].Source === 'Rotten Tomatoes')
            rtRating = body.Ratings[i].Value;
        }
        logResults(`Rotten Tomatoes Rating: ${rtRating}`);
        logResults(`Produced in: ${body.Country}`);
        logResults(`Language: ${body.Language}`);
        logResults(`Plot: ${body.Plot}`);
        logResults(`Actors: ${body.Actors}`);
      }
    });
};

function searchSpotify(song) {
  if (!song) song = 'The Sign Ace of Base';
  spotify.search({ type: 'track', query: song }, function (err, data) {
    if (err) {
      return logResults('Error occurred: ' + err);
    }
    logResults(`Artist(s): ${data.tracks.items[0].artists[0].name}`);
    logResults(`Song Title: ${data.tracks.items[0].name}`);
    logResults(`Preview Link: ${data.tracks.items[0].external_urls.spotify}`);
    logResults(`Album of Track: ${data.tracks.items[0].album.name}`);
  });
}

function logResults(content) {
  fs.appendFile('log.txt', content + '\n', function (err) {
    if (err) throw err;
    console.log(content);
  });
}
/*
### BONUS
* In addition to logging the data to your terminal/bash window, output the data to a .txt file called `log.txt`.
* Make sure you append each command you run to the `log.txt` file. 
* Do not overwrite your file each time you run a command.
  */