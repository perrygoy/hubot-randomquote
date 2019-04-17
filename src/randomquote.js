// Description:
//   Leave a quote, take a quote.
//
//   Adds quotes to hubot that can be retrieved later. Store inspirational
//   quotes, out of context quotes, funny quotes, thought-provoking quotes,
//   you decide! If you later change your mind, you can delete them, too.
//
// Configuration:
//   HUBOT_RANDOMQUOTE_LENGTH - how long the quotes can be. Default is 140.
//
// Commands:
//   hubot addquote "{quote}" [by {user}] - adds the given quote to hubot,
//       crediting the user, or anonymously if no user is given.
//   hubot removequote {number} - quotes are labeled with a number. If you
//       later decide to remove a quote, you can do so from that number.
//   hubot quote {number, author, or nothing} - get a random quote! If a
//       number was supplied, get that specific quote. If an author was
//       supplied, get a random quote by that author.
//   hubot quotestats - show some nifty stats about the stored quotes!
//   hubot fixauthor "oldAuthor" "newAuthor" - changes all quotes submitted
//       for oldAuthor to be credited to newAuthor instead.
//   hubot revertfixes - undo all edits made by "fixauthor" and return quotes
//       to their original credits.
//
// Author:
//   Perry Goy https://github.com/perrygoy


const QuotesMod = require('./quotekeeper')
const QUOTE_MAXLENGTH = process.env.HUBOT_RANDOMQUOTE_LENGTH || 140;

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

    this.stripTag = name => {
        return (name[0] === '@' ? name.slice(1) : name);
    };

    this.addQuote = (quote, author, submitter) => {
        return QuoteKeeper.addQuote(quote, author, submitter);
    };

    this.removeQuote = index => {
        return QuoteKeeper.removeQuote(index);
    };

    this.fixAuthor = (oldAuthor, newAuthor) => {
        return QuoteKeeper.fixAuthor(oldAuthor, newAuthor);
    };

    this.revertFixes = () => {
        return QuoteKeeper.revertFixes();
    };

    this.retrieveQuote = (lookup = false) => {
        robot.logger.info(`Retrieving a quote with lookup: ${lookup}`);
        if (/^\d+$/.test(lookup)) {
            return QuoteKeeper.getQuoteByIndex(lookup);
        } else if (lookup) {
            return QuoteKeeper.getQuoteByAuthor(lookup);
        } else {
            return QuoteKeeper.getRandomQuote();
        }
    };

    this.retrieveQuoteStats = () => {
        return QuoteKeeper.getQuoteStats();
    };

    this.stringifyQuote = quote => {
        return `*Quote #${quote.index}*:\n>"${quote.quote}"\n     —${QuoteKeeper.getAuthor(quote)}`;
    };

    // responses

    robot.respond(/addquote ["“”](.+?)["“”](?: by (.+))/i, response => {
        let quote = response.match[1];
        let author = "_anonymous_";
        if (response.match.length > 2) {
            author = this.stripTag(response.match[2]);
        }
        let submitter = this.getUsername(response);

        if (quote.length > 140) {
            response.send(`Sorry friend, that quote is too long at ${quote.length} characters. I can only remember ${QUOTE_MAXLENGTH} characters maximum.`);
            return;
        }

        let numQuotes = this.addQuote(quote, author, submitter);
        response.send(`OK, added! Total quotes stored: ${numQuotes}`);
    });

    robot.respond(/removequote (\d+)/i, response => {
        let index = Number(response.match[1]);
        if (index <= 0) {
            response.send("That number is too low. Nice try!");
            return;
        }

        let quote = this.removeQuote(index);
        let numQuotes = this.getNumQuotes();
        response.send(`OK, stricken! "${quote.quote}" is gone. Total quotes remaining: ${numQuotes}`);
    });

    robot.respond(/quote(?: ?me)?(?: (.+))?$/i, response => {
        let lookup = false;
        if (response.match.length > 1) {
            lookup = this.stripTag(response.match[1]);
        }
        let quote = this.retrieveQuote(lookup);
        if (quote === null) {
            if (/^\d+$/.test(lookup)) {
                let numQuotes = this.getNumQuotes();
                response.send(`Sorry, I can't map that index to a quote. I currently know ${numQuotes} quotes.`);
            } else {
                response.send(`Sorry, I don't know any quotes by ${lookup}.`);
            }
        } else {
            response.send(this.stringifyQuote(quote));
        }
    });

    robot.respond(/fixauthor ["“”]?(.+?)["“”]?\s+["“”]?(.+?)["“”]?$/i, response => {
        const oldAuthor = response.match[1];
        const newAuthor = response.match[2];
        const numQuotes = this.fixAuthor(oldAuthor, newAuthor);

        if (numQuotes == 0) {
            response.send(`Sorry, I don't know any quotes by ${oldAuthor}.`);
        } else {
            response.send(`OK! Number of quotes updated: ${numQuotes}`);
        }
    });

    robot.respond(/revertfixes$/i, response => {
        this.revertFixes();
        response.send(`OK! All fixed authors reverted to their originally submitted names.`);
    });

    robot.respond(/quotestats$/i, response => {
        const stats = this.retrieveQuoteStats();
        let message = '_Quote Repository Stats_:\n';
        message += `>*Total Quotes*: ${stats.totalQuotes}\n`;
        message += `>*Authors*: ${stats.authors.join(", ")}\n`;
        message += `>  - *Most Quoted*: ${stats.mostQuotes.name}, ${stats.mostQuotes.number} quotes!\n`;
        message += `>*Submitters*: ${stats.submitters.join(", ")}\n`;
        message += `>  - *Most Submitted*: ${stats.mostSubmissions.name}, ${stats.mostSubmissions.number} quotes!\n`;
        if (stats.mostEuphoric) {
            message += `>  - *Most Euphoric*: ${stats.mostEuphoric.name} :face_with_rolling_eyes: \n`;
        }

        response.send(message);
    });

};
