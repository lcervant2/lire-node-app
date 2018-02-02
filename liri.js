require('dotenv').config()
const keys = require('./keys')
const Spotify = require('node-spotify-api')
const Twitter = require('twitter')
const request = require('request')


const spotify = new Spotify(keys.spotify)
const client = new Twitter(keys.twitter)
let fourthArgStr = ''
const command = process.argv[2]

switch (command) {
    case 'my-tweets':
        return showTweets(client, 'rleija_')
    case 'spotify-this-song':
        if (process.argv.length === 4) fourthArgStr = process.argv[3]
        return spotifyMeThis(spotify, fourthArgStr.trim())
    case 'movie-this':
        if (process.argv.length === 4) fourthArgStr = process.argv[3]
        return movieMeThis(keys.omdb.key, fourthArgStr.trim())
    default:
        return;
}

function showTweets(client, screen_name) {
    const params = {screen_name: screen_name, count: 20}

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) return console.error('Error getting tweets: ', err)

        tweets.forEach(function(tweet) {
            console.log(`@${tweet.user.screen_name}: ${tweet.text}`)
            console.log(`Created at: ${tweet.created_at}`)
            console.log('')
        })
    });
}

function spotifyMeThis(spotify, songName) {
    if (!songName.length) console.error('Enter a song name.')

    spotify.search({ type: 'track', query: songName}, function(error, data){
        if (error) return console.log(error)
        data.tracks.items.forEach(function(track) {
            console.log(`Artist(s) : ${track.artists[0].name}`)
            console.log(`Song name: ${track.name}`)
            console.log(`Preview link: ${track.preview_url}`)
            console.log(`Album name: ${track.album.name}`)
            console.log('')
        })
    })
}

function movieMeThis(apiKey, movieName) {
    if (!movieName.length) console.error('Enter a movie name.')

    const omdbURL = `http://www.omdbapi.com/?apikey=${apiKey}&t=${movieName}&plot=short&tomatoes=true`

    request(omdbURL, function (error, response, body) {
        if (error && response.status !== 200) return console.error(error)

        const movieSnapshot = JSON.parse(body)

        console.log(`Movie title: ${movieSnapshot.Title}`)
        console.log(`Movie release year: ${movieSnapshot.Year}`)
        console.log(`IMDB rating: ${movieSnapshot.imdbRating}`)
        console.log(`Country: ${movieSnapshot.Country}`);
        console.log(`Language: ${movieSnapshot.Language}`);
        console.log(`Plot: ${movieSnapshot.Plot}`);
        console.log(`Actors: ${movieSnapshot.Actors}`);
        console.log(`Rotten Tomatoes Rating: ${movieSnapshot.tomatoRating}`);
        console.log(`Rotten Tomatoes URL: ${movieSnapshot.tomatoURL}`);
        console.log('')
    })
}