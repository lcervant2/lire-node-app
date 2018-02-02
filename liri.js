//*Liri Arguments*//
var fs = require('fs');
var os = require('os');
var request = require('request');
var Twitter = require('twitter');
var Spotify = require("node-spotify-api");

var keys = require('./keys.js');

var first_argv = process.argv[2];
var second_argv = process.argv[3];

/*
-Which command to run based on arguments provided or respond with error
-message if argument is not supported.
-Parameters/String cmd LIRI command user wants to execute.
-Parameters/String parameters If needed, argument value provided by user (ie, song or movie).
-Return {}
*/
function liriCommandRunner(cmd, param) {
    switch (cmd) {
        case "my-tweets":
        	//Imput way for user to input twiter accoutn information.
            myTweets();
            break;
        case "spotify-this-song":
        	//Recognize a song string before a function.
            spotifyThis(param)
            break;
        case "movie-this":
            //Input movie string befroe a function.
            movieThis(param)
            break;
        case "do-what-it-says":
            // Add this fucntion.
            doWhatItSays();
            break;
        default:
            console.log(first_argv + " : command not found");
    }
}

/*
-Command: node liri.js my-tweets
-Description: Console output containing last 20 tweets and dtg when tweets were created.
-parameter {}
-return {}
*/
function myTweets() {

    var twitter_client = new Twitter({
        consumer_key: keys.twitter_keys.consumer_key,
        consumer_secret: keys.twitter_keys.consumer_secret,
        access_token_key: keys.twitter_keys.access_token_key,
        access_token_secret: keys.twitter_keys.access_token_secret
    });

    var user = 'laravelphp';
    var tweet_count = 20;

    twitter_client.get('statuses/user_timeline', {screen_name: user, count: tweet_count}, function(error, tweets) {

        if (error)
            throw error;
        else {
            var tweet_data = [];

            for ( i in tweets ) {
                var data = {
                        "Created"   : tweets[i].created_at,
                        "Tweet"     : tweets[i].text,
                        "Retweeted" : tweets[i].retweet_count,
                        "Favorited" : tweets[i].favorite_count
                        };
                tweet_data.push(data);
            }

            console.log("---------------------------- START --------------------------------");
            console.log("Successfully retrieved " + tweets.length + " tweets (maximum 20) from Twitter.");
            console.log("===================================================================");
            // console.log(prettyjson.render(tweet_data, { keysColor  : 'green', stringColor: 'white' }));
            console.log("===================================================================");
            console.log("---------------------------- END ----------------------------------");
        }
    });

    appendLogFile("Executed my-tweets");
}

/*
-Command: node liri.js spotify-this-song '<song name here>'
-Description: Console output containing the following song data: Song title, album title,
-artist(s), preview url for Spotify. If no song is provided, default will
-display data for "The Sign" by Ace of Base.
-Parameter {String} song Title of song to query using Spotify API.
-return {}
*/
function spotifyThis(song) {

    var spotify_client = new Spotify({
        clientId    : keys.spotify_keys.client_id,
        clientSecret: keys.spotify_keys.client_secret
    });

    spotify_client.searchTracks(song).then(function(res) {

        // console.log("-------------------- Debugging -----------------------------------");
        // console.log("Response href: " + res.body.tracks.href);
        // console.log("------------------------------------------------------------------");

        var spot_data = [];
        var tracks = res.body.tracks.items;

        for ( i in tracks ) {
            var data = {
                    "Track"      : tracks[i].name,
                    "Album"      : tracks[i].album.name,
                    "Artist(s)"  : tracks[i].artists[0].name,
                    "Preview URL": tracks[i].preview_url
                    };
            spot_data.push(data);
        }

        // Run another loop in order to print anther Arists(S) If there are more than one. 

        var total_items = tracks.length;

        console.log("---------------------------- START --------------------------------");
        console.log("Successfully retrieved " + total_items + " items from Spotify");
        console.log("===================================================================");
        console.log(prettyjson.render(spot_data, { keysColor  : 'green', stringColor: 'white' }));
        console.log("===================================================================");
        console.log("---------------------------- END ----------------------------------");

    }, function(error) {
            console.error(error);
    });

    appendLogFile("Executed spotify-this-song with argument " + "'" + song  + "'");
}

/*
-Command: node liri.js movie-this '<movie name here>'
-Description: Console output containing the following movie data: Movie title, plot,
-release year, country where movie was produced, language, IMDB rating,
-actors, Rotten Tomatoes rating, Rotten Tomatoes URL.
-If no movie specified, output data for the movie 'Mr. Nobody'.
-
-parameter {string} movie Title of movie to query using OMDB API.
-Rereturn {}
*/
function movieThis(movie) {

    var query_url = 'http://www.omdbapi.com/?t=' + movie +'&y=&plot=long&tomatoes=true&r=json';

    request(query_url, function(error, res, body) {

        if (!error && res.statusCode == 200) {

            var movie_data = {
                "Title"                 : JSON.parse(body).Title,
                "Released"              : JSON.parse(body).Released,
                "Country"               : JSON.parse(body).Country,
                "Language(s)"           : JSON.parse(body).Language,
                "Actors"                : JSON.parse(body).Actors,
                "IMDB Rating"           : JSON.parse(body).imdbRating,
                "Rotten Tomatoes Rating": JSON.parse(body).tomatoRating,
                "Rotten Tomatoes URL"   : JSON.parse(body).tomatoURL,
                "Plot"                  : JSON.parse(body).Plot
            }

            console.log("---------------------------- START --------------------------------");
            console.log("Successfully retrieved OMDB results for " + movie_data.Title + ".");
            console.log("===================================================================");
            // console.log(prettyjson.render(movie_data, { keysColor  : 'green', stringColor: 'white' }));
            console.log("===================================================================");
            console.log("---------------------------- END ----------------------------------");
        }
        else
            console.error(error);
    });

    appendLogFile("Executed movie-this with argument " + "'" + movie  + "'");
}

/*
-Command:node liri.js do-what-it-says
-Description: read random.txt file and call one of LIRI's commands contained in that file.
-Parameter {}
-Return {}
*/
function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(err, random_txt) {

        var ran_txt = random_txt.split(',');
        var func = ran_txt[0];
        var param = ran_txt[1];

        console.log("PARAM: ", param);

        switch (func) {
            case "my-tweets":
                myTweets();
                break;
            case "spotify-this-song":
                spotifyThis(param);
                break;
            case "movie-this":
                movieThis(param);
                break;
        }
    });

    appendLogFile("Executed do-what-it-says");
}

/*
-Appends new log entry to log.txt file.
-Paramenter {}
-Return {}
*/
function appendLogFile(log_entry) {

    var dtg = new Date() + ': ';

    fs.appendFile('log.txt', dtg + log_entry + os.EOL, 'utf8', function(error) {
        if (error)
            throw error;
    });
}


