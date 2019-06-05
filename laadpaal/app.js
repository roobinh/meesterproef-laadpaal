"use strict";

// requires
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const fetch = require('node-fetch')

const graphQlSchema = require('./graphql/schemas')
const graphQlResolvers = require('./graphql/resolver')

const bodyParser = require('body-parser')

// dotenv vars
require('dotenv').config();
const mdb_username = process.env.DB_USERNAME;
const mdb_password = process.env.DB_PASSWORD;

// nodejs
const app = express()
var port = process.env.port || 2500; 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// server settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true //interface to true
}))

// routes
app.get('/typeMelding', function (req, res, next) {
    res.render('pages/complaintType');
});
app.get('/kiesPaal', function (req, res, next) {
    res.render('pages/choosePole');
});

app.get('/', function (req, res, next) {
    res.render('pages/index');
});

// create user
app.post('/createuser', function(req, res, next ) {
    const name = req.body.name;
    const email = req.body.email;

    const query = `
    mutation {
        createUser(userInput: {
          number: "9823184",
          email: "${email}",
          name: "${name}",
          points: 0
        }) {
            _id
        }
      }
    `  
    return fetch('http://localhost:2500/graphql', { 
        method: "POST", 
        headers: { "content-type": "application/json" }, 
        body: JSON.stringify({query}), 
    }).then(response => response.json())
      .then(data => {
            console.log('Here is the data: ', data);
            res.redirect('/kiesPaal')
    });
})

// connect to mongoose
var url = "mongodb+srv://" + mdb_username + ":" + mdb_password + "@laadpaal-klachten-2qggo.gcp.mongodb.net/klachten-db?retryWrites=true"
console.log('connecting to mongodb...')
mongoose.connect(url, { 
    useNewUrlParser: true 
}).then( () => {
    console.log('connected to mongodb!')
}).catch(err => {
    console.log(err)
})

// start server
var server = app.listen(port, () => console.log(`App running, listening on port ${port}!`))
module.exports = app;

