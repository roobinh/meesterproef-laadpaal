const { buildSchema } = require('graphql')

const User = require('./models/user')
const Pole = require('./models/pole')
const Complaint = require('./models/complaint')

const schema = buildSchema(`
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
        complaints: [Complaint!]!
    }

    type RootMutation {
        createUser(userInput: UserInput): User
        createPole(poleInput: PoleInput): Pole
        createComplaint(complaintInput: ComplaintInput): Complaint
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }`
);

const root = { 
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
        return Complaint.find().populate('User')
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
}

module.exports = { root: root, schema: schema }


/*
Example Http Request:
http://localhost:2500/graphql?query={users{name}}

Example post request:
fetch('http://localhost:2500/graphql', {
  body: JSON.stringify({
    query: 'mutation',
    operationName: '...',
    variables: { ... }
  })
})

*/