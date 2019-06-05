const { buildSchema } = require('graphql')

module.exports = buildSchema(`
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
        pole: Pole!
        user: User!
    }

    input ComplaintInput {
        type: String
        description: String
        image: String
        status: String
        date: String
        userId: String
        poleId: String
    }

    type RootQuery {
        users(userId: String): [User!]!
        poles(poleId: String): [Pole!]!
        complaints(complaintId: String): [Complaint!]!
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
