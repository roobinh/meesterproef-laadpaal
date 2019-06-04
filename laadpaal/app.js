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
const Pole = require('./models/pole')
const Complaint = require('./models/complaint')

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

            type Pole {
                _id: ID!
                longitude: Float
                latitude: Float
                chargetype: String
                power: String
                amount: Int
            }

            input PoleInput {
                longitude: Float
                latitude: Float
                chargetype: String
                power: String
                amount: Int
            }

            type Complaint {
                _id: ID!
                type: String
                description: String
                image: String
                status: String
                date: String
            }

            input ComplaintInput {
                type: String
                description: String
                image: String
                status: String
                date: String
            }

            type RootQuery {
                users: [User!]!
                poles: [Pole!]!
            }

            type RootMutation {
                createUser(userInput: UserInput): User
                createPole(poleInput: PoleInput): Pole
                createComplaint(complaintInput: ComplaintInput): Complaint
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),

        rootValue: { 
            // users querry
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

            // create user
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
            },

            // poles querry
            poles: () => {
                return Pole.find()
                .then(poles => {
                    return poles.map(pole => {
                        return {...pole._doc}
                    })
                })
                .catch(err => {
                    throw err
                })
            },

            // create pole
            createPole: args => {
                const pole = new Pole({
                    longitude: args.poleInput.longitude,
                    latitude:   args.poleInput.latitude,
                    chargetype: args.poleInput.chargetype,
                    power: args.poleInput.power,
                    amount: args.poleInput.amount
                })

                return pole
                    .save()
                    .then(result =>{
                        console.log(result) 
                        return { ...result._doc }
                    }).catch(err => {
                        console.log(err)
                        throw err;
                    });
            },

            // complaint querry
            complaints: () => {
                return Complaint.find()
                .then(complaints => {
                    return complaints.map(complaint => {
                        return {...complaint._doc}
                    })
                })
                .catch(err => {
                    throw err
                })
            },

            // create complaint
            createComplaint: args => {
                const complaint = new Complaint({
                    type: args.complaintInput.type,
                    description: args.complaintInput.description,
                    image: args.complaintInput.image,
                    status: args.complaintInput.status,
                    date: args.complaintInput.date,
                    User: '5cf501278710923bb8cd56f4',
                    Pole: '5cf649b7aed14121c86d75f9'
                })

                return complaint   
                    .save()
                    .then(result => {

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