# TumblrBot - Prompt bot for posting to Tumblr 

This is a Prompt bot for uploading quick text posts to your Tumblr. It uses the
starter template for building Prompt bots with Node.js written by Peter
Kaminiski.

Prompt is the command line interface for the real world https://promptapp.io.

If you want to try this out with your own test bot, continue reading below. 

# Register application on Tumblr

We are using Tumblr's API, which supports the OAuth 1.0a Protocol to allow us to post directly to a Tumblr account, so we need to register an application [here](https://www.tumblr.com/oauth/apps) in order to obtain the consumer key and secret. 

Make sure to input the URL you are using to host your bot for the 'Application Website'.

# Prompt Setup  

```git clone https://github.com/mzhang8/tumblr-bot.git```

```cd tumblr-bot```

In the `tumblr-bot` directory, download the node modules used in this project by running the following command:

```npm install```

See the [README file](https://github.com/PeterKaminski09/NodePromptManager) for NodePromptManager for more information about setting up a web server and registering your own Prompt bot. For web hosting, I personally recommend [Heroku](https://www.heroku.com/), as I found it very easy to get running.

In the `api.js` file in the `routes` folder, insert the necessary credentials (your consumer key, consumer secret, bot ID, application URL, and Tumblr URL) in the appropriate locations. Also, generate an API key for the bot and insert it in the corresponding location as well. 

For example, we'll need to replace the following:

```javascript
var conkey = '[INSERT CONSUMER KEY]';
var consecret = '[INSERT CONSUMER SECRET]';
```

# Testing

To test our bot, go to Prompt's Bot Test Interface and send the message '@BOT\_ID link'. You should be able to go through authentication and also receive a message from Prompt verifying this. Once that's finished, send another message '@BOT\_ID test #win'. 

![alt-img](http://s31.postimg.org/qesu798nf/bot_test.png)

Now let's go check out our post...

![alt-img](http://s31.postimg.org/jwnz4v28b/post_test.png)

Hooray, now you can post to your Tumblr account via Prompt!

**Note:** I'm not actually sure whether these instructions will be of use to anyone, but I figured I should learn how to write a nice README file using Markdown anyhow.