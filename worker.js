var randopeep = require('randopeep'),
  Twit = require('twit');

var T = new Twit({
  consumer_key:         process.env.TWITTER_KEY,
  consumer_secret:      process.env.TWITTER_SECRET,
  access_token:         process.env.TWITTER_TOKEN,
  access_token_secret:  process.env.TWITTER_TOKEN_SECRET
});

function tweetBait(){
  var cb = randopeep.clickbait.headline(null, null, true);
  var link = process.env.BASE_URL + '/a/' + [cb.verb, cb.star, cb.noun, cb.headline].map(encodeURIComponent).join('/');
  T.post('statuses/update', { status: link }, function(err, data, response) {
    console.log(err, data)
  })
}

tweetBait();
setInterval(tweetBait, 43200000); // every 12 hours