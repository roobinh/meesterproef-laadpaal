"use strict";

// dotenv
require('dotenv').config();

// requires

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const User = require('./models/user')

const { buildSchema } = require('graphql')

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

app.use(
    '/graphql',
    graphqlHttp({
        schema: buildSchema(`

            type User {
                _id: ID!
                number: String!
                email: String
                name: String
                points: Int
            }

            input UserInput {
                number: String!
                email: String
                name: String
                points: Int 
            }

            type RootQuery {
                users: [User!]!
            }

            type RootMutation {
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),

        rootValue: {
            users: ()=> {
                return User.find()
                .then(users => {
                    return users.map(user => {
                        return {...user._doc}
                    })
                })
                .catch(err => {
                    throw err;
                })
            },
            createUser: (args) => {
                const user = new User({
                    number: args.userInput.number,
                    email: args.userInput.email,
                    name: args.userInput.name,
                    points: args.userInput.points
                })

                return user
                    .save()
                    .then(result =>{
                        console.log(result) 
                        return { ...result._doc }
                    }).catch(err => {
                        console.log(err)
                        throw err;
                    });
            }
        },
        graphiql: true //interface to true
}))

// mongo connection
const mdb_username = process.env.DB_USERNAME;
const mdb_password = process.env.DB_PASSWORD;

// routes
app.use('/', function (req, res, next) {
    res.render('pages/index');
});

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