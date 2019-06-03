
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    const uri = "mongodb+srv://laadpalen:klachten@laadpaal-klachten-2qggo.gcp.mongodb.net/test?retryWrites=true";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    console.log('connecting to mongodb...')

    client.connect(err => {
        console.log('connected!')

        const collection = client.db("klachten-db").collection("USERS");

        //zoek naar alle gebruikers in de tabel
        collection.find().toArray(function(err, result) {
            if(err) {
                console.log(err)
            } else if (result.length) {
                console.log(result)
                res.render('pages/users')
            } else {
                res.send("no documents found")
            }
        })

        client.close();
        console.log('connection closed.')
    });

    res.render('pages/index')


   res.render('pages/index', { title: 'Express' });
});

router.get('/users', function(req, res, next) {
    
})

module.exports = router;
