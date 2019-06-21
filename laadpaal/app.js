"use strict";

// packages
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const session = require('express-session')
const multer = require('multer')
const fs = require('fs');
const socket = require('socket.io');

// graphql
const graphQlSchema = require('./graphql/schemas')
const graphQlResolvers = require('./graphql/resolver')

// dotenv vars
require('dotenv').config();
const mdb_username = process.env.DB_USERNAME;
const mdb_password = process.env.DB_PASSWORD;

// multer
const upload = multer({ dest: './public/images/uploads/' })

// nodejs
const app = express()
const port = process.env.port || 2500;

// start the server
let server = app.listen(port, () => console.log(`App running, listening on port ${port}!`))

// app.set
app.set('views', path.join('views'))
    .set('view engine', 'ejs');

// app.use
app.use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(cookieParser())
    .use(express.static(path.join('public')))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use('/graphql', graphqlHttp({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true // interface
    }))
    .use(session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET
    }))
    .use('/image', express.static('public/images/uploads'))



// login routes
app.get('/', function(req, res, next) {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('pages/login');
    }
});

app.get('/register', function(req, res, next) {
    res.render('pages/register');
});

app.get('/logout', authenticate, function(req, res, next) {
    req.session.destroy();
    res.render('pages/login', { errorMsg: "U bent nu uitgelogd" })
})

app.get('/login/failed', function(req, res, next) {
    res.render('pages/login', { errorMsg: "U bent nog niet ingelogd" });
});

// complaint routes
app.get('/home', authenticate, function(req, res, next) {
    res.render('pages/home', { name: req.session.user.name });
});

app.get('/setpole/:id', authenticate, function(req, res, next) {
    if (req.params.id) {
        req.session.user.complaint = {
            poleId: req.params.id
        }
        res.redirect('/complaint/create')
    } else {
        res.send("idk what happened...")
    }
});

app.get('/complaint/create', authenticate, function(req, res, next) {
    //check if currentpole is set
    console.log(req.session)
    if (req.session.user.complaint) {
        res.render('pages/createComplaint');
    } else {
        res.redirect('/')
    }
});

app.get('/complaint/details/:id', authenticate, function(req, res, next) {
    res.send("This page has yet to come... (id = " + req.params.id + ")");
});

app.get('/complaint/success', authenticate, function(req, res, next) {
    if (req.session.currentComplaint) {
        const complaintId = req.session.currentComplaint;
        const query = ` 
        query {
            complaints(complaintId: "${complaintId}") {
              _id
              type
              description
              image  
              status
              date
              time
              pole {
                longitude
                latitude
                address
              }
              user {
                email
                name
              }
            }
          }
        `

        return fetch('http://localhost:2500/graphql', {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query }),
            }).then(response => response.json())
            .then(data => {
                if (data.data.complaints) {
                    console.log("succesPAge::::", data.data.complaints)
                    res.render('pages/success', { data: data.data.complaints[0] });
                } else {
                    res.send("session.currentcomplaint not found.")
                }
            })
    }
});

app.get('/nearestpole', function(req, res, next) {
    res.render('pages/nearestpole')
})

app.get('/myreports', authenticate, function(req, res, next) {
    const userId = req.session.user.id;
    const query = ` 
    query {
        complaints(userId: "${userId}") {
          _id
          type
          description
          status
          date
          time
            pole {
            _id
            address
          }
          user {
              _id
            email
            name
            points
          }
          date
        }
       }
    `

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data.complaints.length > 0) {
                res.render('pages/myreports', { data: data.data.complaints.reverse() });
            } else {
                res.render('pages/myreports', { data: "error" });
            }
        })
})

function socketSendChat(room, io) {
    // emit msg to room
    var promise = sendChat(room);

    promise.then(function(messages) {
        io.to(room).emit("all-messages", {data: messages} )
    }).catch(function(error) {
        console.log(error)
    })
}

app.get('/myreports/:id', authenticate, function(req, res, next) {
    // sockets
    let io = socket(server);

    // admin id = 5d0b99a3ac92ed4ab0f64fdb
    const complaintId = req.params.id;

    // when user connects
    io.on('connection', function(socket) {
        console.log('a user connected');

        socket.on('join-room', function(data) {

            // set room number
            var room = data;

            // joining user to room
            socket.join(room);


            // if(!req.session.room) {
            //     socketSendChat(room, io);
            // } else {
            //     req.session.room = {
            //         id: room
            //     }

            //     req.session.save()
            //     socketSendChat(room, io);                
            // }



            if(!req.session.room) {

                console.log("new room, sending messages.")
                req.session.room = {
                    id: room
                }

                req.session.save()
                socketSendChat(room, io);
            } else {
                if(req.session.room.id !== room) {
                    console.log('room changed! sending new messages.')
    
                    req.session.room = {
                        id: room
                    }
    
                    socketSendChat(room, io);
                    req.session.save()
                } else {
                    console.log('else')
                    socketSendChat(room, io);
                }           
                }
            })

        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        socket.on('send-message', function(message) {
            writeMessageToDatabase(message, complaintId);
            io.to(complaintId).emit('new-message', {data:message})
        })

    });

    const query = ` 
    query {
        complaints(complaintId: "${complaintId}") {
          _id
          type
          status
          description
            image
          date
          time
          pole {
            _id
            longitude
            latitude
            city
            region
            regioncode
            district
            subdistrict
            address
            postalcode
            provider
            sockets
            usedsockets
          }
        }
       }
    `

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data.complaints) {
                res.render('pages/myreportdetail', { data: data.data.complaints[0] });
            } else {
                res.render('pages/myreports', { errorMsg: "U heeft geen meldingen" });
            }
        })
})

app.get('/reports', authenticate, function(req, res, next) {
    const query = ` 
    query {
        complaints {
          _id
          type
          status
          description
               image
          date
          time
          pole {
            _id
            longitude
            latitude
            city
            region
            regioncode
            district
            subdistrict
            address
            postalcode
            provider
            sockets
            usedsockets
          }
        }
       }
    `

    let poles = [];

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data.complaints) {
                data.data.complaints.forEach(complaint => {
                    if (poles.some(e => e.id === `${complaint.pole._id}`)) {
                        poles.find(x => x.id == `${complaint.pole._id}`).count++
                    } else {
                        poles.push({
                            id: complaint.pole._id,
                            address: complaint.pole.address,
                            count: 1
                        })

                    }
                });
                poles.sort(function(a, b) {
                    return b.count - a.count;
                });
                res.render('pages/reports', { data: poles });
            } else {
                res.render('pages/myreports', { errorMsg: "U heeft geen meldingen" });
            }
        })
})

app.get('/reports/:id', authenticate, function(req, res, next) {
    const poleId = req.params.id;
    const query = ` 
    query {
        complaints(poleId: "${poleId}") {
          _id
          type
          status
          description
               image
          date
          time
          pole {
            _id
            longitude
            latitude
            city
            region
            regioncode
            district
            subdistrict
            address
            postalcode
            provider
            sockets
            usedsockets
          }
        }
       }
    `

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data.complaints) {
                console.log(data.data.complaints)
                res.render('pages/reportsdetail', { data: data.data.complaints.reverse() });
            } else {
                res.render('pages/myreports', { errorMsg: "U heeft geen meldingen" });
            }
        })

})

app.post('/choosePole', authenticate, function(req, res, next) {
    console.log(req.body.pole)

    if (req.body.pole) {
        req.session.user.complaint = {
            poleId: req.body.pole
        }

        res.redirect('/complaint/create')
    }
})

app.post('/createuser', function(req, res, next) {

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
app.post('/login', function(req, res, next) {
    const email = req.body.email;
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
                res.render('pages/register', { email: email });
            }
        });
})

app.post('/dashboard/changestatus/:id', function(req, res, next) {
    console.log(req.params.id)
    const query = `
        mutation {
            updateComplaint(complaintId:"${req.params.id}",  complaintInput: {
            status: "${req.body.state}"
            }) {
                type
                description
                image
                status
                date
                time
              }
        }
    `
    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            console.log(data)
            res.redirect('/dashboard/' + req.params.id)
        });
})


// create complaint in database
app.post('/createComplaint', authenticate, upload.single('image'), function(req, res, next) {
    console.log("--------Creating Complaint in Database--------")
    console.log(req.session)
    console.log(req.body)
    console.log("Req.file = ", req.file)

    const type = req.body.type
    const description = req.body.description.trim();
    const userId = req.session.user.id
    const poleId = req.session.user.complaint.poleId
    const status = "In behandeling"

    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth(); //Be careful! January is 0 not 1
    const year = currentDate.getFullYear();
    let time = ""
    if (currentDate.getMinutes() < 10) {
        time = currentDate.getHours() + ":0" + currentDate.getMinutes();
    } else {
        time = currentDate.getHours() + ":" + currentDate.getMinutes();
    }
    const dateString = date + "-" + (month + 1) + "-" + year;


    const query = `
    mutation {
        createComplaint(complaintInput: {
          type: "${type}",
          description: "${description}",
          image: "",
          status: "${status}",
          date: "${dateString}",
          time: "${time}",
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
            if (data.errors) {
                console.log("--- new report unsuccesfully created ---")
                res.send("complaint unsuccessfull")
            } else {
                console.log("--- new report succesfully created ---")
                if (req.file) { // als er een image wordt meegestuurd
                    fs.rename(req.file.path, req.file.destination + data.data.createComplaint._id + '.jpeg', err => {
                        if (err) {
                            console.log(err)
                        }
                    })
                }
                req.session.currentComplaint = data.data.createComplaint._id
                res.redirect('/complaint/success')
            }
        });
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
    if (req.session.user) {
        console.log("Authentication Succeeded.")
        next();
    } else {
        console.log("Authentication failed.")
        res.redirect('/login/failed')
    }
}

// Dashboard
app.get('/dashboard', function(req, res, next) {
    const query = ` 
    query {
        complaints {
          _id
          type
          status
          description
               image
          date
          time
          pole {
            _id
            longitude
            latitude
            city
            region
            regioncode
            district
            subdistrict
            address
            postalcode
            provider
            sockets
            usedsockets
          }
        }
       }
    `

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data.complaints) {
                res.render('pages/dashboard', { data: data.data.complaints });
            } else {
                res.render('pages/dashboard', { errorMsg: "err" });
            }
        })
})

app.get('/dashboard/:id', function(req, res, next) {
    const id = req.params.id;
    const query = ` 
    query {
        complaints(complaintId:"${id}") {
          _id
          type
          status
          description
               image
          date
          time
          pole {
            _id
            longitude
            latitude
            city
            region
            regioncode
            district
            subdistrict
            address
            postalcode
            provider
            sockets
            usedsockets
          }
        }
       }
    `

    return fetch('http://localhost:2500/graphql', {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query }),
        }).then(response => response.json())
        .then(data => {
            if (data.data) {
                res.render('pages/dashboarddetails', { data: data.data.complaints });
            } else {
                res.send('ID niet gevonden')
            }
        })
})

function sendChat(complaintId) {
    return new Promise(function(resolve, reject) {
        const query = ` 
        query {
            messages(complaintId: "${complaintId}") {
              user {
                _id
                name
              }
              date
              time
              content
            }
          }
        `
        return fetch('http://localhost:2500/graphql', {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query }),
        })  .then(response => response.json())
            .then(data => {
                if (data.data) {
                    resolve(data.data.messages);
                } else {
                    reject("error")
                }
        })
    }) 
}

function writeMessageToDatabase(msg, user, complaint) {

}

module.exports = app;




/* Fill database, delete at end of project

            const csv = require('csv-parser');
            var allQuerrys = []

            async function createPoles() {
                var providers = ["NUON", "EVBOX", "EVNET", "ALVEN"]

                fs.createReadStream('dfLocations.csv')
                    .pipe(csv())
                    .on('data', (row) => {
                        var country = row.Region
                        var postal = row.PostalCode;

                        if(country == "Amsterdam") {
                            var longitude = parseFloat(row.Longitude)
                            var latitude = parseFloat(row.Latitude)
                            var city = row.City
                            var region = row.Region
                            var regioncode = row.State
                            var district = row.District
                            var subdistrict = row.SubDistrict
                            var address = row.Address
                            var postalcode = row.PostalCode
                            var randomprovider = providers[Math.floor(Math.random() * providers.length)]
                            var provider = randomprovider
                            var sockets = Math.floor(Math.random() * 2) + 1
                            var usedsockets = Math.ceil(Math.random() * sockets)

                            if(longitude && latitude) {

                                const query = `
                                mutation {
                                    createPole(poleInput: {
                                        longitude: ${longitude},
                                        latitude: ${latitude},
                                        city: "${city}",
                                        region: "${region}",
                                        regioncode: "${regioncode}",
                                        district: "${district}",
                                        subdistrict: "${subdistrict}",
                                        address: "${address}",
                                        postalcode: "${postalcode}",
                                        provider: "${provider}",
                                        sockets: ${sockets},
                                        usedsockets: ${usedsockets}
                                        }
                                    ) {
                                      city
                                      region
                                      regioncode
                                      district
                                      subdistrict
                                      address
                                      postalcode
                                      provider
                                      sockets
                                      usedsockets
                                    }
                                }
                                `

                                allQuerrys.push(query)
                                       }
                    }})
                    .on('end', () => {
                        console.log('all querrys added..');
                        console.log(allQuerrys.length)
                        addToDB(0)
                    }
                );
            }

            function addToDB(number) {
                console.log('adding to db...' + number);

                var query = allQuerrys[number]
                return fetch('http://localhost:2500/graphql', {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ query }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if(number <= allQuerrys.length) {
                            addToDB(number+1);

                            if (data.errors) {
                                console.log("Complaint unsuccessfully created")
                            } else {
                                console.log("--- Complaint aangemaakt ---")
                            }
                        }
                    });
            }

            createPoles();

*/