
var express = require('express');
var mongodb = require('mongodb');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Express' });
});

router.get('/users', function(req, res, next) {
  var mongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/klachtendb'

  mongoClient.connect(url, function(err, client) {
    if(err) {
      console.log('unable to connect to server', err);
    } else {
      console.log('connection with mongodb establisched')

      var db = client.db('klachtendb')
      
      //maak verbinding met juiste tabel
      var collection = db.collection('users');

      //zoek naar alle gebruikers in de tabel
      collection.find().toArray(function(err, result) {
        if(err) {
          console.log(err)
        } else if (result.length) {
          res.render('pages/users', {
            users: result
          })
        } else {
          res.send("no documents found")
        }

        client.close();

      })
    }
  })
})
module.exports = router;
