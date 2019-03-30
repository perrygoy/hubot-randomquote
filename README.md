hubot-randomquote
=================

Store, retrieve, and delete quotes!

Any quotes will do. Quote your friends, quote your loved ones, quote your favorite or least-favorite celebrities. Once you've populated your bot, you can retrieve random ones on request!

    hubot addquote "Congratulations! The simple fact that you're standing here listening to me means you've made a glorious contribution to science." by Cave Johnson
    > OK, added! Total quotes stored: 1
    hubot quote
    > Quote #1: "Congratulations! The simple fact that you're standing here listening to me means you've made a glorious contribution to science." —Cave Johnson
    hubot removequote 1
    > OK, stricken! Total quotes remaining: 0

## Commands
* hubot addquote {quote} [by {user}] - adds the given quote to betsbot, crediting the user, or anonymously if no user is given.
* hubot removequote {number} - quotes are labeled with a number. If you want to remove a quote, you can do so using that number.
* hubot quote - get a random quote!

Uses hubot-brain to keep track of the quotes.

## Add it to your hubot!

Run the following command

    $ npm install hubot-randomquote --save

Then add `hubot-randomquote` to the `external-scripts.json` file (you may need to create this file).

    ["hubot-randomquote"]
