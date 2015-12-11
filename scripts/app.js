var pg = require('pg');
var db = process.env.DATABASE_URL || "postgres://kwok:qldo@localhost:5432/kwok";
var path = require('path');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, '../public')))
  .use(bodyParser.urlencoded({extended:false}))
  .use(bodyParser.json());

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

app.post('/signIn', function(req,res) {
  var user = req.body.username;
  var pass = req.body.password;
  // look up to see if this record exists in table of users
  // btw i need a good hash function cuz i aint about to store passwords as fuckin strings aight i aint that one
  return new Promise(function(resolve, reject) {
    client.query('SELECT * FROM users WHERE username = \''+user+'\' AND password = \''+pass+'\'', function (err, result) {
      // do stuff
      if (err || result.rows.length < 1) {
        // user not found; credentials wrong
        // maybe send an email to me so i can know what the hell happened
        reject("not found");
      } else {
        // make another query that's like, yo set the token
        console.log(result.rows[0]);
        resolve(result.rows[0].id);
      }
    });
  }).then(function(id) {
    var timestamp = (new Date()).getTime();
    client.query('UPDATE users SET last_logged_in_token = '+timestamp+' WHERE id = '+id, function(err, result) {
      // return a thing that says logged in, on the frontend i'll set a token in localstorage or something
      res.send({token: timestamp});
    });
  }).catch(function(msg) {
    res.status(404).send({errorMsg: msg});
  });
});

app.post('/checkToken', function(req,res) {
  // security holes 5eva
  var token = req.body.token;
  return new Promise(function(resolve, reject) {
    client.query('SELECT * FROM users WHERE last_logged_in_token = \''+token+'\'', function(err, result) {
      if (err) {
        // bad credentials, please login
        reject(err);
      } else {
        // return a thing that says logged in
        resolve(result.rows[0].id);
      }
    });
  }).then(function(id){
    var timestamp = (new Date()).getTime();
    client.query('UPDATE users SET last_logged_in_token = '+timestamp+' WHERE id = '+id, function(err, result) {
      // return a thing that says logged in, on the frontend i'll set a token in localstorage or something
      res.send({token: timestamp});
    });
  }).catch(function(msg) {
    res.status(404).send({errorMsg: msg});
  });
});

app.get('/getMappings', function(req,res) {
  var params = req.query;
  var currentCardId = params.currentCardId;
  var convoId = params.convoId;
  getNextCards(convoId, currentCardId, function(results) {
    res.json(results);
  });
});

app.get('/getNextCards', function(req,res) {
  var params = req.query;
  var currentCardId = params.currentCardId;
  var convoId = params.convoId;
  client.query('SELECT * FROM allCards WHERE id IN (SELECT next_phrase_id FROM mappings WHERE conv_id = '+convoId+' AND prev_phrase_id = '+currentCardId+')', function(err, result) {
    console.log(result.rows);
    res.json(result.rows);
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
