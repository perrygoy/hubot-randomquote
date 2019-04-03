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

    this.getUsername = response => {
        const user = response.message.user;
        if (user.profile) {
            return user.profile.display_name || user.name;
        } else {
            return user.name;
        }
    };

    this.addQuote = (quote, author, submitter) => {
        return QuoteKeeper.addQuote(quote, author, submitter);
    };

    this.removeQuote = index => {
        return QuoteKeeper.removeQuote(index);
    };

    this.retrieveQuote = (index = false) => {
        if (index) {
            return QuoteKeeper.getQuote(index);
        } else {
            return QuoteKeeper.getRandomQuote();
        }
    };


    robot.hear(/addquote ["“”]?(.+?)["“”]?(?: by (.*))/i, response => {
        let quote = response.match[1];
        let author = "_anonymous_";
        if (response.match.length > 2) {
            author = response.match[2];
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

        let numQuotes = this.getNumQuotes();
        let quote = this.removeQuote(index);
        response.send(`OK, stricken! "${quote.quote}" is gone. Total quotes remaining: ${numQuotes}`);
    });


    robot.hear(/quote(?: me)?(?: (\d+))?$/i, response => {
        let index = false;
        if (response.match.length > 1) {
            index = Number(response.match[1]);
        }
        let quote = this.retrieveQuote(index);
        if (quote === null) {
            let numQuotes = this.getNumQuotes();
            response.send(`Sorry, I can't map that index to a quote. I currently know ${numQuotes} quotes.`);
        } else {
            response.send(`*Quote #${quote.index}*:\n>"${quote.quote}"\n     —${quote.author}`);
        }
    });

};
