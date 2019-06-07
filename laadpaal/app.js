"use strict";

// packages
const path =             require('path');
const express =          require('express');
const cookieParser =     require('cookie-parser');
const graphqlHttp =      require('express-graphql')
const mongoose =         require('mongoose')
const fetch =            require('node-fetch')
const bodyParser =       require('body-parser')
const session =          require('express-session')

// graphql
const graphQlSchema =    require('./graphql/schemas')
const graphQlResolvers = require('./graphql/resolver')

// dotenv vars
require('dotenv').config();
const mdb_username = process.env.DB_USERNAME;
const mdb_password = process.env.DB_PASSWORD;

// nodejs
const app = express()
var port = process.env.port || 2500;

// app.set
app .set('views', path.join('views'))
    .set('view engine', 'ejs');

// app.use
app .use(express.json())
    .use(express.urlencoded({extended: false}))
    .use(cookieParser())
    .use(express.static(path.join('public')))
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use('/graphql', graphqlHttp({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true })) //interface
    .use(session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET }))

// routes
app.get('/', function (req, res, next) {
    
    if(req.session.user) {
        res.redirect('/home')
    } else {
        res.render('pages/login');
    }
});

app.get('/register', function (req, res, next) {
    res.render('pages/register');
});

app.get('/home', authenticate, function (req, res, next) {
    res.render('pages/choosepole');
});

app.get('/complaint/success', authenticate, function(req, res, next) {
    if(req.session.currentComplaint) {
        // next ->
        //      1. get request to server
        //      2. render complaint information on page
        res.render('pages/success');
    } else {
        res.send("session.currentcomplaint not found.")
    }
})

app.get('/complaint/create', authenticate, function (req, res, next) {
    res.render('pages/createComplaint');
});

app.get('/login/failed', function (req, res, next) {
    res.render('pages/loginfailed');
});

app.post('/choosePole', authenticate, function (req, res, next) {
    console.log(req.body.pole)

    if (req.body.pole) {
        req.session.user.complaint = {
            poleId: req.body.pole
        }

        res.redirect('/complaint/create')
    }
})

app.post('/createuser', function (req, res, next) {

    // set vars
    const name = req.body.name;
    const email = req.body.email;

    // set query
    const query = `
    mutation {
        createUser(userInput: {
          number: "0",
          email: "${email}",
          name: "${name}",
          points: 0
        }) {
            _id
            name
            email
        }
      }
    `

    // request to server
    return fetch('http://localhost:2500/graphql', {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
    })
        .then(response => response.json())
        .then(data => {
            
            // if user is created successfully...
            if (data.data.createUser.email) {
                // set session data
                req.session.user = {
                    email: data.data.createUser.email,
                    name: data.data.createUser.name,
                    id: data.data.createUser._id
                };
                res.redirect('/home')
            } else {
                res.send("User not created")
            }


        });
})

//login
app.post('/login', function (req, res, next) {

    // email user wants to login with
    const email = req.body.email;

    // set querry
    const query = `
    query {
        users(email: "${email}") {
          _id
          number
          email
          name   
        }
      }
    `

    // post request
    return fetch('http://localhost:2500/graphql', {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
    }).then(response => response.json())
        .then(data => {
            data = data.data.users[0]

            if (data) { // login success
                req.session.user = {
                    email: data.email,
                    name: data.name,
                    id: data._id
                }
                res.redirect('/home')
            } else { //login failed
                res.redirect('/register')
            }
        });
})

// create complaint in database
app.post('/createComplaint', authenticate, function (req, res, next) {
    console.log("--------Creating Complaint in Database--------")
    console.log(req.session)
    const type = req.body.type
    const image = "temp_image.jpg"
    const description = req.body.description
    const userId = req.session.user.id
    const poleId = req.session.user.complaint.poleId
    const status = "Pending"
    const date = new Date();
    const date2 = date.getDay() + "/" + date.getMonth() + "/" + date.getYear()

    const query = `
    mutation {
        createComplaint(complaintInput: {
          type: "${type}",
          description: "${description}",
          image: "${image}",
          status: "${status}",
          date: "${date2}",
          userId: "${userId}",
          poleId: "${poleId}"
        }) {
          _id
          type
          description
          image
          status
          date
        }
      }
    `

    console.log(query)

    return fetch('http://localhost:2500/graphql', {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
    }).then(response => response.json())
        .then(data => {
            if(data.errors) {
                console.log("Complaint unsuccessfully created")
                res.send("complaint unsuccessfull")
            } else {
                console.log("--- Complaint aangemaakt ---")
                console.log(data)
                req.session.currentComplaint = data.data.createComplaint._id
                res.redirect('/complaint/success')
            } 
        }
    );
})

// connect to mongoose
var url = "mongodb+srv://" + mdb_username + ":" + mdb_password + "@laadpaal-klachten-2qggo.gcp.mongodb.net/klachten-db?retryWrites=true"
console.log('Connecting to MongoDB...')
mongoose.connect(url, {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to MongoDB!')
}).catch(err => {
    console.log(err)
})

// authenticate
function authenticate(req, res, next) {
    console.log("---- Authenticating -------")
    console.log("Session user: ")
    if (req.session.user) { 
        console.log("Authentication Succeeded.")
        console.log(req.session.user)
        next();
    } else {
        console.log("Authentication failed.")
        res.redirect('/login/failed')
    }
}

// start server
var server = app.listen(port, () => console.log(`App running, listening on port ${port}!`))
module.exports = app;

