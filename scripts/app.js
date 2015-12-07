var pg = require('pg');
var db = "postgres://kwok:qldo@localhost:5432/kwok";
var path = require('path');

var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, '/../public')));

var client = new pg.Client(db);
client.connect();

function stripPunctuation(phrase) {
  return phrase.toLowerCase().replace(/[^A-Za-zöäåÖÄÅ\s]/g,'');
}

function getNextCards(convoId, prevId, callback) {
  client.query('SELECT * FROM mappings WHERE conv_id = '+convoId+' AND prev_phrase_id = '+prevId, function(err, result) {
    callback(result.rows);
  });
}

app.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/getNextCards', function(req,res) {
  var params = req.query;
  var currentCardId = params.currentCardId;
  var convoId = params.convoId;
  getNextCards(convoId, currentCardId, function(results) {
    res.json(results);
  });
});

app.get('/isCardNext', function(req,res) {
  var params = req.query;
  var prevId = params.prevId;
  var nextId = params.nextId;
  var convoId = params.convoId;
  getNextCards(convoId, prevId, function(results) {
    return res.json({
      isIn: results.reduce(function(isIn, row) {
        return isIn || row.next_phrase_id == nextId;
      }, false)
    });
  });
});

app.get('/getCardFromId', function(req,res) {
  var params = req.query;
  var cardId = params.cardId;
  client.query('SELECT * FROM allCards WHERE id = '+cardId, function(err, result) {
    res.json(result.rows);
  });
});

app.get('/getCardFromPhrase', function(req,res) {
  var params = req.query;
  //strip phrase
  var phrase = stripPunctuation(params.phrase);
  client.query('SELECT * FROM allCards WHERE cleanedphrase = \''+phrase+'\'', function(err, result) {
    res.json(result.rows);
  });
});

app.get('/getRandom', function(req,res) {
  client.query("SELECT * FROM beginningCards ORDER BY RANDOM() LIMIT 1", function(err, result) {
    res.json(result.rows);
  });
});

app.get('/', function(req, res) {
});

app.listen(process.env.PORT || 3000);
