var express = require('express');
var router = express.Router();
var requestHelper = require('../utils/requestHelper');

var Tumblr = require('tumblrwks');
var request = require('request');
var conkey = '[INSERT CONSUMER KEY]'; 
var consecret = '[INSERT CONSUMER SECRET]';
var acckey, accsecret;

/* Main entry point for prompt requests */
router.post('/api/1.0', function(req, res, next) {
  var response, redirect_uri;
  
  // Get the user's message
  var message = requestHelper.getMessage(req.body);

  if (message.toString() == "link") {

    // 3-legged OAuth 1.0a
    var qs = require('querystring'), 
        oauth = { 
          callback: 'http://prompt-it.herokuapp.com', 
          consumer_key: conkey,
          consumer_secret: consecret 
        }, 
        url = 'https://www.tumblr.com/oauth/request_token';

    request.post({url:url, oauth:oauth}, function (e, r, body) {
      var req_data = qs.parse(body)
      var uri = 'https://www.tumblr.com/oauth/authorize'
        + '?' + qs.stringify({oauth_token: req_data.oauth_token})
      var oauthSecretToken = req_data.oauth_token_secret;

      // Send response
      response = {
        sendmms: true,
        showauthurl: true,
        authstate: null,
        text: "Your Tumblr account has been connected.",
        speech: "Your Tumblr account has been connected.",
        status: "OK",
        webhookreply: null,
        images: [
          {
            imageurl: null,
            alttext: null
          }
        ]
      }

      res.json(response);

      // After user is redirected to serve
      var auth_data = qs.parse(body), 
          oauth = { 
            consumer_key: conkey,
            consumer_secret: consecret,
            token: auth_data.oauth_token,
            token_secret: oauthSecretToken,
            verifier: auth_data.oauth_verifier
          },
          url = 'https://www.tumblr.com/oauth/access_token';
      request.post({url:url, oauth:oauth}, function (e, r, body) {
        var perm_data = qs.parse(body);

        acckey = perm_data.oauth_token;
        accsecret = perm_data.oauth_token_secret; 
        console.log(acckey);
      })  
    }) 

  } else {

    // Check if authenticated
    var reply;
    if (acckey == undefined) {
      reply = "Your Tumblr has not been linked. Please send @tumblr link to get started."
    } else {
      
      // Parse
      var content = message.toString().split("#");

      // Collect hashtags
      var hashtags = "";
      for (var i = 1; i < content.length; i++) {
        hashtags += content[i];
        if (i != content.length - 1) {
          hashtags += ", ";
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

      if (content[0].indexOf("http://") == 0) {
        tumblr.post('/post', {type: 'link', url: content[0], tags: hashtags}, function(err, json) {
           console.log(json);
        }); 
        reply = "The link has been posted to your Tumblr.";
      } else {
        tumblr.post('/post', {type: 'text', body: content[0], tags: hashtags}, function(err, json) {
          console.log(json);
        }); 
        reply = "The text has been posted to your Tumblr.";
      }
    }

    // Send rseponse
    response = {
      sendmms: true,
      showauthurl: false,
      authstate: null,
      text: reply,
      speech: reply,
      status: "OK",
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
});

module.exports = router;
