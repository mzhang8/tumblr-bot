var express = require('express');
var router = express.Router();
var requestHelper = require('../utils/requestHelper');

var Tumblr = require('tumblrwks');
var request = require('request');
var qs = require('querystring');
var conkey = '[INSERT CONSUMER KEY]'; 
var consecret = '[INSERT CONSUMER SECRET]';
var token, secret;
var acckey, accsecret;

var apikey = '[INSERT PROMPT API KEY]' 
var uuid; 

/* Main entry point for prompt requests */
router.use(function(req, res, next) {
  var response, reply;

  // Step 3 of authorization after user is redirected to servers
  if (req.originalUrl.toString().indexOf("oauth") > 0) {
    var oauth = {
      consumer_key: conkey,
      consumer_secret: consecret,
      token: req.query.oauth_token,
      token_secret: secret,
      verifier: req.query.oauth_verifier.toString()
    }, url = 'https://www.tumblr.com/oauth/access_token';

    request.post({url: url, oauth: oauth}, function(e, r, body) {
      var perm_data = qs.parse(body);

      acckey = perm_data.oauth_token.slice(0);
      accsecret = perm_data.oauth_token_secret.slice(0); 
    });

    // Send response to bot
    var options = {
      url: 'https://api.dev.promptapp.io/api/1.0/webhook/@[YOUR BOT ID]', 
      headers: {
        'Prompt-API-key': apikey
      },
      form: {
        uuid: uuid,
        message: 'Your Tumblr account has been connected.'
      }
    };
    request.post(options, function(e, r, body) {
      res.render('index', { title: 'TumblrBot' });
    });

  } else {
    // Parse the user's message
    var message = requestHelper.getMessage(req.body).toString();

    // Begin 3-legged OAuth 1.0a
    if (message === "link") {
      uuid = req.body['uuid'].toString();

      // Step 1 of authorization
      var oauth = { 
            callback: 'http://prompt-it.herokuapp.com/api/1.0/', 
            consumer_key: conkey,
            consumer_secret: consecret 
          }, 
          url = 'https://www.tumblr.com/oauth/request_token';

      // Step 2 of authorization
      request.post({url: url, oauth: oauth}, function(e, r, body) {
        var req_data = qs.parse(body);
        var uri = 'https://www.tumblr.com/oauth/authorize'
                  + '?' + qs.stringify({oauth_token: req_data.oauth_token});
        token = req_data.oauth_token.slice(0);
        secret = req_data.oauth_token_secret.slice(0);

        // Send response
        response = {
          sendmms: true,
          showauthurl: false,
          authstate: null,
          text: 'Connect to your Tumblr account: https://www.tumblr.com/oauth/authorize?oauth_token=' + token,
          speech: 'Connect to your Tumblr account',
          status: 'OK',
          webhookreply: null,
          images: [
            {
              imageurl: null,
              alttext: null
            }
          ]
        };

        res.json(response);
      });

    } else {
      // Check if authenticated
      if (acckey === undefined) {
        reply = 'Your Tumblr has not been linked. Please send @tumblr link to get started.'
      } else {
        // Split content 
        var content = message.split("#");

        // Collect hashtags
        var hashtags = '';
        for (var i = 1; i < content.length; i++) {
          hashtags += content[i];
          if (i !== content.length - 1) {
            hashtags += ', ';
          }
        }

        var tumblr = new Tumblr(
          {
            consumerKey: conkey,
            consumerSecret: consecret,
            accessToken: acckey,
            accessSecret: accsecret
          }, "prompt-bot.tumblr.com"  
        ); 

        // Post link or text to tumblr
        if (content[0].indexOf("http://") === 0 || content[0].indexOf("https://") === 0) {
          tumblr.post('/post', {type: 'link', url: content[0], tags: hashtags}, function(err, json) {
             console.log(json);
          }); 
          reply = 'The link has been posted to your Tumblr.';
        } else {
          tumblr.post('/post', {type: 'text', body: content[0], tags: hashtags}, function(err, json) {
            console.log(json);
          }); 
          reply = 'The text has been posted to your Tumblr.';
        }
      }

      // Send response
      response = {
        sendmms: true,
        showauthurl: false,
        authstate: null,
        text: reply,
        speech: reply,
        status: 'OK',
        webhookreply: null,
        images: [
          {
            imageurl: null,
            alttext: null
          }
        ]
      }

      res.json(response);
    }
  }
});

module.exports = router;

