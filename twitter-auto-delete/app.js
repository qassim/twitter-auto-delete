const Twit = require('twit');

const Twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

const now = Date.now();

const getAllTweets = (max_id = null, cb) => {
  let utweets = [];
  Twitter.get('statuses/user_timeline', { count: 201, screen_name: process.env.TWITTER_USERNAME, ...(max_id && { max_id }) }, function (err, data, response) {
    utweets.push(...data);
    if (data.length >= 200) {
      getAllTweets(data[data.length - 1].id_str, cb);
    } else {
      cb(utweets);
    }
  })
};

exports.handler = () => {
  return getAllTweets(null, (tweets) => {
    const tweetsToDelete = tweets.filter((tweet) => {
      const tweetTime = Date.parse(tweet.created_at)
      const ts = tweetTime;

      const nowTS = new Date(now);
      const thenTS = new Date(ts);

      const difference = Math.round((nowTS.getTime() - thenTS.getTime()) / (1000 * 3600 * 24))

      return difference >= process.env.DAYS_OLD_DELETE;
    });

    const incrementTimeout = 100;
    let currentTimeout = 0;

    tweetsToDelete.forEach((tweet) => {
      currentTimeout = currentTimeout + incrementTimeout;

      setTimeout(() => {
        Twitter.post(`statuses/destroy/:id`, { id: tweet.id_str }, (err) => {
          if (!err) {
            console.log(`Deleted id: ${tweet.id_str}`)
          }
        })
      }, currentTimeout);
    })
  });

}

