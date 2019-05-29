"use strict";

require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express()
var port = process.env.port || 2500;

var server = app.listen(port, () => console.log(`App running, listening on port ${port}!`))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// server settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// mongo connection
const mdb_username = process.env.DB_USERNAME;
const mdb_password = process.env.DB_PASSWORD;
console.log(mdb_username, mdb_password);


const uri = "mongodb+srv://" + mdb_username + ":" + mdb_password + "@laadpaal-klachten-2qggo.gcp.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });

console.log('connecting to mongodb...')
client.connect(err => {
    console.log('connected!')

    const collection = client.db("klachten-db").collection("USERS");

    //zoek naar alle gebruikers in de tabel
    collection.find().toArray(function (err, result) {
        if (err) {
            // console log error
            console.log(err)
        } else if (result.length) {
            // working
            console.log(result)
        } else {
            // collection is empty
        }
    })

    client.close();
    console.log('connection closed.')
});

// routes
app.use('/', function (req, res, next) {
    console.log()
    res.render('pages/index');
});



module.exports = app;
