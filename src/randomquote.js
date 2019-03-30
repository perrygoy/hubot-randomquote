// Description:
//   Leave a quote, take a quote.
//
//   Adds quotes to hubot that can be retrieved later. Store inspirational
//   quotes, out of context quotes, funny quotes, thought-provoking quotes,
//   you decide! If you later change your mind, you can delete them, too.
//
// Commands:
//   hubot addquote {quote} [by {user}] - adds the given quote to betsbot,
//       crediting the user, or anonymously if no user is given.
//   hubot removequote {number} - quotes are labeled with a number. If you
//       later decide to remove a quote, you can do so from that number.
//   hubot quote - get a random quote!
//
// Author:
//   Perry Goy https://github.com/perrygoy


const QuotesMod = require('./quotekeeper')


module.exports = function(robot) {

  const QuoteKeeper = new QuotesMod(robot);

  this.getUsername = (response) => {
    const user = response.message.user;
    if (user.profile) {
        return user.profile.display_name || user.name;
    } else {
        return user.name;
    }
  };

  this.addQuote = (quote, author) => {
    return QuoteKeeper.addQuote({"quote": quote, "author": author});
  };

  this.removeQuote = (index) => {
    return QuoteKeeper.removeQuote(index);
  };

  this.retrieveQuote = () => {
    return QuoteKeeper.getRandomQuote();
  };


  robot.hear(/addquote "?(.+?)"?(?: by (.*))/i, response => {
    let quote = response.match[1];
    let author = "_anonymous_";
    if (response.match.length > 2) {
      let author = response.match[2];
    }
    let submitter = this.getUsername(response);

    let numQuotes = this.addQuote(quote, author, submitter);
    response.send(`OK, added! Total quotes stored: ${numQuotes}`);
  });


  robot.hear(/removequote (\d+)/i, response => {
    let index = Number(response.match[1]);
    if (index <= 0) {
        response.send("That number is too low. Nice try!");
        return;
    }

    let numQuotes = this.removeQuote(index);
    response.send(`OK, stricken! Total quotes remaining: ${numQuotes}`);
  });


  robot.hear(/quote(?: me)?$/i, response => {
    let quote = this.retrieveQuote();
    if (quote === null) {
        response.send("I don't know any quotes yet! Add some more by using `addquote`.");
    } else {
        response.send(`*Quote #${quote.index}*:\n>"${quote.quote}"\n     —${quote.author}`);
    }
  });

};
