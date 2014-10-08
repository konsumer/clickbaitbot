var express = require('express'),
  exphbs  = require('express-handlebars'),
  app = express(),
  errorHandler = require('errorhandler'),
  randopeep = require('randopeep'),
  images = require('google-images'),
  wikipedia = require("wikipedia-js"),
  port = parseInt(process.env.PORT, 10) || 4567;

app.use(errorHandler({ dumpExceptions: true, showStack: true }));

var hbs = exphbs.create({ helpers: require('./views/helpers') });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// /Chris%20Hadfield/Is%20Chris%20Hadfield%20doing%20body%20shots%20with%20Macaulay%20Culkin%3F
app.get('/:star/:headline', function(req, res){
  var info = {
    star : req.param('star'),
    headline: req.param('headline')
  };

  wikipedia.searchArticle({query: info.star, format: "html", summaryOnly: true}, function(err, htmlWikiText){
    if (err) return res.send(500, err);
    info.text = htmlWikiText;
    images.search(info.star, function(err, images){
      if (err) return res.send(500, err);
      info.images = images;
      res.render('index', info);
    });
  });
  
});

console.log('server listening at http://localhost:' + port);
app.listen(port);