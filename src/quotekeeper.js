// Description
//   QuoteKeeper module
//   Stores, retrieves, and deletes random quotes for hubot.


function randomInt(max_ind) {
    return Math.floor(Math.random() * max_ind);
};


module.exports = function(robot) {

  this.getQuotes = () => {
    return robot.brain.data.randomquotes || [{"quote": "Hello! This is a default quote. You can add a new quote by saying `addquote \"quote\" by user`, and remove this one by saying `removequote 1`."}];
  };

  this.addQuote = (quote, author) => {
    let quotes = this.getQuotes();
    let numQuotes = quotes.push({"quote": quote, "author": author, "submitter": submitter});

    this.save(quotes);

    return numQuotes;
  };

  this.removeQuote = (index) => {
    if (index <= 0) {
      return;
    }
    let quotes = this.getQuotes();
    quotes.splice(index - 1, 1);

    this.save(quotes);

    return quotes.length;
  };

  this.getRandomQuote = () => {
    let quotes = this.getQuotes();
    let index = randomInt(quotes.length);
    let quote = Object.assign({}, quotes[index]);

    quote.index = index;
    return quote
  };

};
