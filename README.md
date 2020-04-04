# Twitter Auto Delete


_Warning: There isn't going to be a comprehensive tutorial to get this running, there is a level of expected familiarity with AWS and the twitter dev experience required_.

This is a quick 'n dirty Node script intended to run on a daily schedule on AWS Lambda to delete all your tweets that are older than a specified age (configurable).

If you have more than 3200 tweets on your timeline, it's advised you use something else for the initial cleanup as this script would take a long time to get through a backlog of tweets if it's only running daily. My approach was to write a script which parses the twitter data archive you can request and delete all the tweets by their tweet ID in that archive (which matched my specified age cut off).

I wrote that script in a scratch environment and don't have a copy of it anymore, but I may rewrite it and release it at some point. 

This script is intended to _maintain_ your account once it's already in a state you're happy with (e.g. all your tweets older than 6 months have already been deleted).

## Getting started

### Deployment

The easiest way to deploy this is to use the AWS SAM CLI, see [Installing the AWS SAM CLI
](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) for how to install the CLI.

Once installed and you've configured your AWS credentials, etc, clone this repository and in the root directory run:

```bash
sam build
sam deploy --guided
```

And follow the instructions to deploy it into your account.

Once deployed, go to the (AWS Lambda web console), find your deployed function and configure the following **environment variables**:

#### Twitter API keys

You may need to sign up for a developer account or re-use API keys from an existing app you already have registered, go to [Twitter Apps](https://developer.twitter.com/en/apps) for more. The API keys you need are:

* CONSUMER_KEY
* CONSUMER_SECRET
* ACCESS_TOKEN
* ACCESS_TOKEN_SECRET

#### Script configuration

* TWITTER_USERNAME - your twitter display name (e.g. [qassim_uk](https://twitter.com/qassim_uk)) - _string_
* DAYS_OLD_DELETE - the age in days of the tweets you wish to delete (e.g. 180) - _integer_


### Development / Local invocation

If you wish to develop or just locally invoke, you can use the SAM CLI to do so.

First, create an environment variable json file (e.g. `env.json`) that looks like this, replacing with your actual configuration values:

```json
{
  "TwitterAutoDeleteFunction": {
    "CONSUMER_KEY": "SNIP",
    "CONSUMER_SECRET": "SNIP",
    "ACCESS_TOKEN": "SNIP",
    "ACCESS_TOKEN_SECRET": "SNIP",
    "TWITTER_USERNAME": "qassim_uk",
    "DAYS_OLD_DELETE": 180
  }
}
```

```bash
sam build
sam local invoke -n env.json
```