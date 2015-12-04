var pg = require('pg');
var db = "postgres://kwok:qldo@localhost:5432/kwok";

var express = require('express');
var app = express();

// turn all this shit into sql queries
// then wrap them all in endpoints

var client = new pg.Client(db);
client.connect();

app.get('/getNextCards', function(req,res) {
  var params = req.query;
  var currentCardId = params.currentCardId;
  var convoId = params.convoId;
  client.query('SELECT * FROM mappings WHERE conv_id = '+convoId+' AND prev_phrase_id = '+currentCardId, function(err, result) {
    console.log("these are results");
    console.log(result.rows);
  });
});

app.get('/getCardFromPhrase', function(req,res) {
  var params = req.query;
  //strip phrase
  var phrase = stripPunctuation(params.phrase);
  console.log(phrase);
  client.query('SELECT * FROM allCards WHERE cleanedphrase = \''+phrase+'\'', function(err, result) {
    res.json(result.rows);
  });
});

function stripPunctuation(phrase) {
  return phrase.toLowerCase().replace(/[^A-Za-z\s]/g,'');
}

app.get('/getRandom', function(req,res) {
  client.query("SELECT * FROM beginningCards ORDER BY RANDOM() LIMIT 1", function(err, result) {
    res.json(result.rows);
  });
});

app.listen(process.env.PORT || 3000);
console.log('Started on port ${app.server.address().port}');
