// Description
//   QuoteKeeper module
//   Stores, retrieves, and deletes random quotes for hubot.


function randomInt(max_ind) {
    return Math.floor(Math.random() * max_ind);
};

function mode(array) {
    return array.reduce(
        (a, b, index, array) =>
        (array.filter(v => v === a).length >= array.filter(v => v === b).length ? a : b)
    );
};

module.exports = function(robot) {

    this.getQuotes = () => {
        return robot.brain.data.randomquotes || [{
            quote: "Hello! This is a default quote. You can add a new quote by saying `addquote \"quote\" by user`, and remove this one by saying `removequote 1`.",
            author: "hubot-randomquote",
            fixedAuthor: null,
            submitter: "hubot-randomquote"
        }];
    };

    this.getNumQuotes = () => {
        return this.getQuotes().length;
    };

    this.getAuthor = quote => {
        return (!quote.fixedAuthor ? quote.author : quote.fixedAuthor);
    };

    this.save = quotes => {
        robot.brain.data.randomquotes = quotes;
        robot.brain.emit('save', robot.brain.data);
    };

    this.addQuote = (quote, author, submitter) => {
        let quotes = this.getQuotes();
        let numQuotes = quotes.push({quote: quote, author: author, submitter: submitter});

        this.save(quotes);
        return numQuotes;
    };

    this.removeQuote = index => {
        if (index <= 0) {
            return;
        }
        let quotes = this.getQuotes();
        let quote = quotes[index - 1];
        quotes.splice(index - 1, 1);

        this.save(quotes);
        return quote;
    };

    this.fixAuthor = (oldAuthor, newAuthor) => {
        let quotes = this.getQuotes();
        let quotesToChange = quotes.filter(quote => this.getAuthor(quote) == oldAuthor)
        quotesToChange.map(quote => quote.fixedAuthor = newAuthor);

        this.save(quotes);
        return quotesToChange.length
    };

    this.revertFixes = () => {
        let quotes = this.getQuotes();
        quotes.map(quote => quote.fixedAuthor = null);

        this.save(quotes);
    };

    this.getQuote = (index, quotes = null) => {
        const fullQuotes = this.getQuotes();
        if (quotes === null) {
            quotes = fullQuotes;
        }
        let quote = quotes[index];
        quote.index = fullQuotes.indexOf(quote) + 1;
        return Object.assign({}, quote);
    };

    this.getRandomQuote = () => {
        robot.logger.info(`Getting a random quote.`);
        const quotes = this.getQuotes();
        if (quotes.length == 0) {
            return null;
        }
        let index = randomInt(quotes.length);
        return this.getQuote(index);
    };

    this.getQuoteByIndex = index => {
        robot.logger.info(`Getting quote by index: ${index}`);
        const quotes = this.getQuotes();
        if (index <= 0 || index > quotes.length) {
            return null;
        }
        return this.getQuote(index - 1);
    };

    this.getQuoteByAuthor = author => {
        robot.logger.info(`Getting quote by author: ${author}`);
        const quotes = this.getQuotes();
        const author_quotes = quotes.filter(quote => this.getAuthor(quote) == author)

        let index = randomInt(author_quotes.length);
        return this.getQuote(index, author_quotes);
    };

    this.getQuoteStats = () => {
        const quotes = this.getQuotes();
        const authors = quotes.map(quote => this.getAuthor(quote));
        const mostQuotes = mode(authors);
        const submitters = quotes.map(quote => quote.submitter);
        const mostSubmissions = mode(submitters);

        return {
            totalQuotes: quotes.length,
            authors: [...new Set(authors)],
            submitters: [...new Set(submitters)],
            mostQuotes: {
                name: mostQuotes,
                number: authors.filter(author => author == mostQuotes).length,
            },
            mostSubmissions: {
                name: mostSubmissions,
                number: submitters.filter(author => author == mostSubmissions).length,
            },
        };
    };
};
