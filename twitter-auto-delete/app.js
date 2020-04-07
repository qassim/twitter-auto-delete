
const Twitter = require('twitter-lite');
const client = new Twitter({
  subdomain: "api",
  version: "1.1",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const TWITTER_USERNAME = process.env.TWITTER_USERNAME;
const DAYS_OLD_DELETE = process.env.DAYS_OLD_DELETE;

const getAllTweets = async (max_id = null, cumulativeTweets = []) => {
  const parameters = {
    count: 201,
    screen_name: TWITTER_USERNAME,
    ...(max_id && { max_id })
  };
  const timeline = cumulativeTweets;
  const tweets = await client.get('statuses/user_timeline', parameters);
  timeline.push(...tweets);

  return tweets.length >= 200 ? await getAllTweets(tweets[tweets.length - 1].id_str, timeline) : timeline;
}

const deleteTweets = async (tweets) => {
  const incrementTimeout = 100;
  let currentTimeout = 0;

  const requests = tweets.map((tweet) => {
    currentTimeout = currentTimeout + incrementTimeout;

    return new Promise((resolve) => setTimeout(() => {
      console.log(`Deleting tweet id: ${tweet.id_str}`);
      return resolve(client.post(`statuses/destroy/:id`, { id: tweet.id_str }))
    }, currentTimeout));
  })

  return await Promise.all(requests);
}

exports.handler = async () => {
  const now = Date.now();
  const tweets = await getAllTweets();

  console.log(`Got ${tweets.length} tweets for user ${TWITTER_USERNAME}. Checking for tweets to delete...`)

  const tweetsToDelete = tweets.filter((tweet) => {
    const tweetTime = Date.parse(tweet.created_at)
    const nowTS = new Date(now);
    const thenTS = new Date(tweetTime);
    const difference = Math.round((nowTS.getTime() - thenTS.getTime()) / (1000 * 3600 * 24))

    return difference >= DAYS_OLD_DELETE;
  });

  if (tweetsToDelete.length > 0) {
    await deleteTweets(tweetsToDelete);
  } else {
    console.log(`There are no tweets of age >= ${DAYS_OLD_DELETE} days to delete for user ${TWITTER_USERNAME}.`)
  }

};

