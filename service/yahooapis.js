/**
 * Created by kennytchu on 2017-03-22.
 */
var request = require('request');

const URL_BASE = 'https://query.yahooapis.com/v1/public/yql?format=json&q=';
const CITY_NAME_QUERY = 'select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=';

var weather = function(city,callback){
    request(URL_BASE+CITY_NAME_QUERY+'"'+city+'")', function (error, response, body) {
        //Check for error
        if(error){
            return console.log('Error:', error);
        }

        //Check for right status code
        if(response.statusCode !== 200){
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var value = JSON.parse(body);
        callback(value);
    });
}

module.exports = {
    getWeather: weather
}