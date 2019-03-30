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
    return QuoteKeeper.add({"quote": quote, "author": author});
  };

  this.removeQuote = (index) => {
    return QuoteKeeper.remove(index);
  };

  this.retrieveQuote = () => {
    return QuoteKeeper.getRandomQuote();
  };


  robot.hear(/addquote "?(.+?)"?(?: by (.*))/i), response => {
    let quote = response.match[1];
    if (response.match.length > 2) {
      let user = response.match[2];
    } else {
      let user = "_anonymous_";
    }
    let submitter = this.getUsername(response);

    let numQuotes = this.addQuote(quote, author, submitter);
    response.send(`OK, added! Total quotes stored: ${numQuotes}`);
  };


  robot.hear(/removequote (\d+)/i), response => {
    let index = Number(response.match[1]);
    if (index <= 0) {
        response.send("That number is too low. Nice try!");
        return;
    }

    let numQuotes = this.removeQuote(index);
    response.send(`OK, stricken! Total quotes remaining: ${numQuotes}`);
  };


  robot.hear(/quote(?: me)?$/i), response => {
    let quote = this.retrieveQuote();
    response.send(`Quote #${quote.index}: "${quote.quote}" —${quote.author}`);
  };

};
