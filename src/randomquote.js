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
//   hubot addquote "{quote}" [by {user}] - adds the given quote to hubot, crediting the user, or anonymously if no user is given.
//   !qadd "{quote}" [by {user}] - shorthand for the above
//   hubot removequote {number} - quotes are labeled with a number. If you later decide to remove a quote, you can do so from that number.
//   !qremove {number} - shorthand for the above
//   hubot quote {number, author, or nothing} - get a random quote! If a number was supplied, get that specific quote. If an author was supplied, get a random quote by that author.
//   !quote {number, author, or nothing} - shorthand for the above
//   hubot quotesearch {term} - searches the quotes for the specified term.
//   !qsearch {term} - shorthand for the above
//   hubot quotestats - show some nifty stats about the stored quotes!
//   hubot fixauthor "oldAuthor" "newAuthor" - changes all quotes submitted for oldAuthor to be credited to newAuthor instead.
//   hubot revertfixes - undo all edits made by "fixauthor" and return quotes to their original credits.
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
        if (typeof name !== "string") {
            return name;
        }
        return (name[0] === '@' ? name.slice(1) : name);
    };

    this.addQuote = (quote, author, submitter) => {
        return QuoteKeeper.addQuote(quote, author, submitter);
    };

    this.removeQuote = index => {
        return QuoteKeeper.removeQuote(index);
    };

    this.searchQuotes = searchTerm => {
        return QuoteKeeper.searchQuotes(searchTerm);
    };

    this.truncateQuote = (quote, fulcrum) => {
        const startOfFulcrum = quote.toLowerCase().indexOf(fulcrum.toLowerCase());
        const endOfFulcrum = startOfFulcrum + fulcrum.length;
        const padding = Math.max(25 - fulcrum.length, 0);
        return `${startOfFulcrum > padding ? '...' : ''}${quote.slice(Math.max(0, startOfFulcrum - padding), Math.min(endOfFulcrum + padding, quote.length))}${endOfFulcrum < quote.length - padding ? '...' : ''}`;
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
        return `*Quote #${quote.index}*:\n>"${quote.quote}"\n     —${QuoteKeeper.getAuthor(quote)} (${quote.indexByAuthor} of ${quote.totalByAuthor})`;
    };

    // handlers

    this.handleAddQuote = (response, quote, author = "_anonymous_") => {
        author = this.stripTag(author);
        const submitter = this.getUsername(response);

        if (quote.length > 140) {
            response.send(`Sorry friend, that quote is too long at ${quote.length} characters. I can only remember ${QUOTE_MAXLENGTH} characters maximum.`);
            return;
        }

        const numQuotes = this.addQuote(quote, author, submitter);
        response.send(`OK, added! Total quotes stored: ${numQuotes}`);
    };

    this.handleRemoveQuote = (response, index) => {
        if (index <= 0) {
            response.send("That number is too low. Nice try!");
            return;
        }

        const quote = this.removeQuote(index);
        const numQuotes = this.getNumQuotes();
        response.send(`OK, stricken! "${quote.quote}" is gone. Total quotes remaining: ${numQuotes}`);
    };

    this.handleGetQuote = (response, lookup = false) => {
        lookup = this.stripTag(response.match[1]);
        const quote = this.retrieveQuote(lookup);
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
    };

    this.handleQuoteSearch = (response, searchTerm) => {
        if (searchTerm.length < 3) {
            response.send(`Sorry, I can't search using a term less than 3 characters long.`);
            return;
        }
        const quotes = this.searchQuotes(searchTerm);
        if (quotes.length == 0) {
            response.send(`Sorry, I don't know any quotes containing "${searchTerm}".`);
        } else {
            let message = `I know ${quotes.length} quote${quotes.length != 1? 's' : ''} about "${searchTerm}":\n`;
            for (const quote of quotes) {
                message += `• *${quote.index}*: "${this.truncateQuote(quote.quote, searchTerm)}" by ${QuoteKeeper.getAuthor(quote)}\n`;
            }
            response.send(message);
        }
    };

    this.handleFixAuthor = (response, oldAuthor, newAuthor) => {
        const numQuotes = this.fixAuthor(oldAuthor, newAuthor);
        if (numQuotes == 0) {
            response.send(`Sorry, I don't know any quotes by ${oldAuthor}.`);
        } else {
            response.send(`OK! Number of quotes updated: ${numQuotes}`);
        }
    };

    this.handleRevertFixes = (response) => {
        this.revertFixes();
        response.send(`OK! All fixed authors reverted to their originally submitted names.`);
    };

    this.handleQuoteStats = (response) => {
        const stats = this.retrieveQuoteStats();
        let message = '_Quote Repository Stats_:\n';
        message += `>*Total Quotes*: ${stats.totalQuotes}\n`;
        message += `>*Authors*: ${stats.authors.join(", ")}\n`;
        message += `>  - *Most Quoted*: ${stats.mostQuotes.name}, ${stats.mostQuotes.number} quotes!\n`;
        message += `>*Submitters*: ${stats.submitters.join(", ")}\n`;
        message += `>  - *Most Submitted*: ${stats.mostSubmissions.name}, ${stats.mostSubmissions.number} quotes!\n`;
        if (stats.mostEuphoric.name) {
            message += `>  - *Most Euphoric*: ${stats.mostEuphoric.name} :face_with_rolling_eyes: \n`;
        }
        response.send(message);
    };

    // responses

    robot.respond(/addquote ["“”](.+?)["“”](?: by (.+))/i, response => {
        this.handleAddQuote(response, response.match[1], response.match[2]);
    });

    robot.hear(/^!(qadd|addquote) ["“”](.+?)["“”](?: by (.+))/i, response => {
        this.handleAddQuote(response, response.match[1], response.match[2]);
    });

    robot.respond(/removequote (\d+)/i, response => {
        this.handleRemoveQuote(response, Number(response.match[1]));
    });

    robot.hear(/^!(qremove|removequote) (\d+)/i, response => {
        this.handleRemoveQuote(response, Number(response.match[1]));
    });

    robot.respond(/quote(?: ?me)?(?: (.+))?$/i, response => {
        this.handleGetQuote(response, response.match[1])
    });

    robot.hear(/^!quote(?: ?me)?(?: (.+))?$/i, response => {
        this.handleGetQuote(response, response.match[1])
    });

    robot.respond(/quotesearch\s+(.+)/i, response => {
        this.handleQuoteSearch(response, response.match[1]);
    });

    robot.hear(/^!(qsearch|quotesearch|searchquotes?)\s+(.+)/i, response => {
        this.handleQuoteSearch(response, response.match[1]);
    });

    robot.respond(/fixauthor ["“”]?([^"]+)["“”]?\s+["“”]?([^"]+)["“”]?$/i, response => {
        this.handleFixAuthor(response, response.match[1], response.match[2]);
    });

    robot.respond(/revertfixes$/i, response => {
        this.handleRevertFixes(response);
    });

    robot.respond(/quotestats$/i, response => {
        this.handleQuoteStats(response);
    });

    robot.hear(/^!(qstats|quotestats)$/i, response => {
        this.handleQuoteStats(response);
    });
};
