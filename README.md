# liribot
### Description
    Command line API calling program that calls and displays information from the following APIS: Spotify, OMDB API, and BandsInTown API.

    The first supplied argument must match a valid command.  Subsequent arguments are received as a query string for the selected API.

## Commands
   * `concert-this` 
        - Searches BandsInTown for upcoming events using query arguments, default Third Eye Blind
   * `spotify-this-song`
        - Searches Spotify for track information using query arguments, default The Sign by Ace of Base
   * `movie-this`
        - Searches OMDB for movie information by title using query arguments, default My. Nobody
   * `do-what-it-says`
        - Reads text from random.txt.  Performs valid command with comma separated query.