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

var imageCache = {}, infoCache = {};

//get images & text for a thing
function getInfo(what, cb){
  var info = {};
  
  var innercb = function(err, htmlWikiText){
    if (err) return cb(err);
    info.text = htmlWikiText;
    infoCache[what] = htmlWikiText;
    
    if (imageCache[what]) {
      info.images = imageCache[what];
      return cb(null, info);
    }

    images.search(what, function(err, images){
      if (err) return cb(err);
      info.images = images;
      imageCache[what] = images;
      return cb(null, info);
    });
  }

  if (infoCache[what]){
    innercb(null, infoCache[what]);
  }

  wikipedia.searchArticle({query: what, format: "html", summaryOnly: true}, innercb);
}

// reaching in & re-adding these methods
randopeep.int = function(max){
    max = max || 10;
    return Math.floor(Math.random() * max);
};

randopeep.randomEl =  function (array) {
    return array[randopeep.int(array.length)];
};

app.get('/', function(req, res){
  var cb = randopeep.clickbait.headline(null, null, true);
  res.redirect(req.protocol + '://' + req.get('host') + '/a/' + [cb.verb, cb.star, cb.noun, cb.headline].map(encodeURIComponent).join('/'));
});

// /a/doing%20body%20shots%20with/Chris%20Hadfield/Macaulay%20Culkin/Is%20Chris%20Hadfield%20doing%20body%20shots%20with%20Macaulay%20Culkin%3F
app.get('/a/:verb/:star/:noun/:headline', function(req, res){
  var info = {
    headline: req.param('headline'),
    star : {val: req.param('star')},
    noun: {val: req.param('noun')},
    verb: {val: req.param('verb')},
    permalink: req.protocol + '://' + req.get('host') + req.originalUrl
  };

  res.render('index', info);

  console.log('baited!', info);

  getInfo(info.star.val, function(err, infoIn){
    info.star.images = infoIn.images;
    info.star.image = randopeep.randomEl(infoIn.images);
    info.star.text = infoIn.text;

    getInfo(info.noun.val, function(err, infoIn){
      info.noun.images = infoIn.images;
      info.noun.image = randopeep.randomEl(infoIn.images);
      info.noun.text = infoIn.text;

      getInfo(info.verb.val, function(err, infoIn){
        info.verb.images = infoIn.images;
        info.verb.image = randopeep.randomEl(infoIn.images);
        info.verb.text = infoIn.text;

        res.render('index', info);
      });
    });
  });

});

console.log('server listening at http://localhost:' + port);
app.listen(port);