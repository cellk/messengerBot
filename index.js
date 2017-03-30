var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var BotWit = require('./wit');
var request = require('request');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

const FBHOOK_TOKEN = '';
const PAGE_ACCESS_TOKEN = "";

function getUser(userID,callback) {
    var fb = 'https://graph.facebook.com/v2.6/'+userID+'?fields=first_name,last_name,locale,timezone,gender&access_token='+PAGE_ACCESS_TOKEN;
    request(fb, function (error, response, body) {
        var user = JSON.parse(body);
        user.id = userID;
        callback(user);
    });
}

/**
 * Just a dummy front page
 */

app.get('/', function (req, res) {
    res.send('This is Bot Server -- Work in progress');
});

/**
 * Facebook Webhook
 */
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === FBHOOK_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid token');
    }
});

/**
 * handler receiving messages from facebook
 */
app.post('/webhook', function (req, res) {
    var data = req.body;
    if (data.object === 'page') {
        data.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && !event.message.is_echo)
                {
                    const sender = event.sender.id;
                    const {text, attachments} = event.message;

                    if (text) {
                        getUser(sender,function (user) {
                            BotWit.read(user, text)
                        })
                    }else if(attachments){
                        console.log('attachments received');
                    }else {
                        console.log('received event', JSON.stringify(event));
                    }
                }
            })
        })
    }
    res.sendStatus(200);
});


