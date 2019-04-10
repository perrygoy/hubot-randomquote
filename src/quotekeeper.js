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
            submitter: "hubot-randomquote"
        }];
    };

    this.getNumQuotes = () => {
        return this.getQuotes().length;
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

    this.getQuote = index => {
        const quotes = this.getQuotes();
        let quote = Object.assign({}, quotes[index]);
        quote.index = index + 1;
        return quote;
    };

    this.getRandomQuote = () => {
        const quotes = this.getQuotes();
        if (quotes.length == 0) {
            return null;
        }
        let index = randomInt(quotes.length);
        return this.getQuote(index);
    };

    this.getQuoteByIndex = index => {
        const quotes = this.getQuotes();
        if (index <= 0 || index > quotes.length) {
            return null;
        }
        return this.getQuote(index - 1);
    };

    this.getQuoteByAuthor = author => {
        const quotes = this.getQuotes();
        const author_quotes = quotes.filter(quote => quote.author == author)

        let index = randomInt(author_quotes.length);
        return this.getQuote(index);
    };

    this.getQuoteStats = () => {
        const quotes = this.getQuotes();
        const authors = quotes.map(quote => quote.author);
        const mostQuotes = mode(authors);
        const submitters = quotes.map(quote => quote.submitter);
        const mostSubmissions = mode(submitters);

        return {
            totalQuotes: quotes.length,
            authors: [...new Set(authors)],
            submitters: [...new Set(submitters)],
            mostQuotes: {
                name: mostQuotes,
                number: authors.count(mostQuotes),
            },
            mostSubmissions: {
                name: mostSubmissions,
                number: submitters.count(mostSubmissions,)
            },
        };
    };
};
