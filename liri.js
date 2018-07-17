require('dotenv').config();

var fs = require("fs");
var keys = require('./keys.js');
var request = require('request');
var twitter = require('twitter');
var Spotify = require('node-spotify-api');

var liriCommand = process.argv[2];
var input = process.argv[3];


//LIRI commands
function commands(liriCommand, input) {
    switch (liriCommand) {
        case "my-tweets":
            getTweets(input);
            break;

        case "spotify-this-song":
            getSong(input);
            break;

        case "movie-this":
            getMovie(input);
            break;

        case "do-what-it-says":
            getRandom();
            break;

        default:
            console.log("Please enter one of the following commands: 'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says' followed by parameter.");
    }
}

// Twitter
function getTweets(input) {
    var client = new twitter(keys.twitter);
    var twitterUserName = input;

    var params = { screen_name: twitterUserName, count: 20 };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (error) {
            console.log(error);
        }
        else {
            for (var i = 0; i < tweets.length; i++) {
                console.log("Tweet: " + tweets[i].text + "\nCreated: " + tweets[i].created_at);
                var logTweets = twitterUserName + "\nTweet: " + tweets[i].created_at + "\nTweet Text: " + tweets[i].text + "\n-------\n";
                fs.appendFile('log.txt', logTweets, function (err) {
                    if (err) throw err;
                });
            }
        }
    })
};

// Spotify
function getSong(songName) {
    var spotify = new Spotify(keys.spotify);

    if (!songName) {
        songName = "The Sign";
    };

    // console.log(songName);

    spotify.search({ type: 'track', query: songName }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {

            var logSong = "\nArtist: " + data.tracks.items[0].artists[0].name + "\nSong name: " + data.tracks.items[0].name + "\nPreview Link: " + data.tracks.items[0].preview_url +
                "\nAlbum Name: " + data.tracks.items[0].album.name + "\n";

            console.log(logSong);

            fs.appendFile('log.txt', logSong, function (err) {
                if (err) throw err;
            });
        };
    });
};

function getMovie(movieName) {
    if (!movieName) {
        movieName = "mr nobody";
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json&tomatoes=true&apikey=trilogy";

    console.log(queryUrl);

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var movieObject = JSON.parse(body);

            var movieResults =
                "Title: " + movieObject.Title + "\r\n" +
                "Year: " + movieObject.Year + "\r\n" +
                "Imdb Rating: " + movieObject.imdbRating + "\r\n" +
                "Rotten Tomatoes Rating: " + movieObject.tomatoRating + "\r\n" +
                "Country: " + movieObject.Country + "\r\n" +
                "Language: " + movieObject.Language + "\r\n" +
                "Plot: " + movieObject.Plot + "\r\n" +
                "Actors: " + movieObject.Actors + "\r\n";

            console.log(movieResults);

            fs.appendFile('log.txt', movieResults, function (err) {
                if (err) throw err;
            });
            logResults(response);
        }
        else {
            console.log("Error :" + error);
            return;
        }
    });
};

//Random
function getRandom() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        else {
            console.log(data);

            var randomData = data.split(",");
            //passes data into getSong function
            commands(randomData[0], randomData[1]);
        }
        console.log("test" + randomData[0] + randomData[1]);
    });
};

//Function to log results from the other functions
function logResults(data) {
    fs.appendFile("log.txt", data, function (err) {
        if (err)
            throw err;
    });
};

commands(liriCommand, input);
