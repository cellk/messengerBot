const WIT_TOKEN = '';
const PAGE_ACCESS_TOKEN = "";

var Wit = require('node-wit').Wit;
var request = require('request');
var weather = require('./service/yahooapis');
var wit = new Wit({accessToken: WIT_TOKEN, actions});

// Save user sessions
var sessions = {};

//session and action
var firstEntityValue = function (entities, entity) {
    var val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value

    if (!val) {
        return null
    }
    return typeof val === 'object' ? val.value : val
}

var findOrCreateSession = function (fbid) {
    var sessionId;

    // If user has a session
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid
    )
    {
        sessionId = k
    }
})

    // Create new session
    if (!sessionId) {
        sessionId = new Date().toISOString()
        sessions[sessionId] = {
            fbid: fbid,
            context: {
                _fbid_: fbid
            }
        }
    }

    return sessionId
}

var actions = {
    send({sessionId}, {text}) {
        const recipient = sessions[sessionId].fbid;

        sendMessage(recipient.id, {text: text});
        return new Promise(function (resolve, reject) {
            return resolve();
        });
    },
    getForecast({sessionId, context, text, entities}) {
        //Get forecast
        var location = firstEntityValue(entities, "location")

        return new Promise(function (resolve) {
            weather.getWeather(location, function (res) {
                val = res.query.results.channel.item.condition.text + ' in ' + location + ' : ' + res.query.results.channel.item.condition.temp + '°';

                context.forecast = val;
                return resolve(context);
            });
        });
    }
}

var read = function (sender, message) {
    // Find existing user session
    var sessionId = findOrCreateSession(sender);

    wit.runActions(
        sessionId, // the user's current session
        message, // the user's message
        sessions[sessionId].context // the user's current session state
    ).then((context) => {
        // Our bot did everything it has to do.
        // Now it's waiting for further messages to proceed.
        console.log('Waiting for next user messages');

    // Updating the user's current session state
    sessions[sessionId].context = context;
}).
    catch((err) => {
        console.error('Oops! Got an error: ', err.stack || err);
})
}

// Generic function to send messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

module.exports = {
    read: read
}
