var Spotify = require('node-spotify-api');
var moment = require('moment');
var request = require("request");
const dotenv = require("dotenv").config();
var fs = require('fs');
const keys = require("./keys");
var spotify = new Spotify(keys.spotify);
const bandsInTown = keys.bandsInTown;
const OMDB = keys.OMDB;
//Parse command line args
if (process.argv[2]) {
  let selection = process.argv[2];
  if (process.argv[3]) {
    process.argv.shift();
    process.argv.shift();
    process.argv.shift();
    var queryString = process.argv.join(' ');
  }
  //call bot functionality
  selectOperation(selection, queryString);
} else logResults('no arguments supplied');
/**
 * Directs by selection method calls with the Query string
 * @param {string} selection
 *  selection must be concert-this, spotify-this-song, movie-this, or do-what-it-says
 * @param {string} queryString 
 *  user provided search string for use with API call methods
 */
function selectOperation(selection, queryString) {
  if (selection === 'concert-this') {
    searchBandsInTown(queryString);
  } else if (selection === 'spotify-this-song') {
    searchSpotify(queryString);
  } else if (selection === 'movie-this') {
    searchOMDB(queryString);
  } else if (selection === 'do-what-it-says') {
    //import random.txt split on comma then call selectOperation with parsed information
    fs.readFile('random.txt', 'utf8', function (err, data) {
      if (err) throw err;
      let stuff = data.split(',');
      let test = stuff[1].substring(stuff[1].indexOf('"') + 1, stuff[1].lastIndexOf('"'));
      selectOperation(stuff[0], test);
    });
  }
}
/**
 * searches the BandsInTown API with artist information.
 * Displays upcoming event venues, locations and dates
 * @param {string} artist 
 *  search string for API call
 */
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
/**
 * Searches the OMDB API for movie information by title search
 * Displays various information received from the API
 * @param {string} movie 
 *  search string for API call
 */
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
/**
 * Searches spotify using its node package by track using the song search string
 * Displays Artist, Title, Album and provides a spotify preview url
 * @param {string} song
 *  Search term for API query
 */
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
/**
 * Displays content to the console log and writes it to log.txt
 * @param {string} content
 *  information to be logged
 */
function logResults(content) {
  fs.appendFile('log.txt', content + '\n', function (err) {
    if (err) throw err;
    console.log(content);
  });
}