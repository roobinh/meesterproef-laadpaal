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
        longitude: Float!
        latitude: Float!
        city: String
        region: String
        regioncode: String
        district: String
        subdistrict: String
        address: String
        postalcode: String
        provider: String
        sockets: Float
        usedsockets: Float
    }

    input PoleInput {
        longitude: Float!
        latitude: Float!
        city: String
        region: String
        regioncode: String
        district: String
        subdistrict: String
        address: String
        postalcode: String
        provider: String
        sockets: Float
        usedsockets: Float
    }

    type Complaint {
        _id: ID!
        type: String
        description: String
        image: String
        status: String
        date: String
        time: String
        pole: Pole!
        user: User!
    }

    input ComplaintInput {
        type: String
        description: String
        image: String
        status: String
        date: String
        time: String
        userId: String
        poleId: String
    }

    input updateComplaint {
        type: String
        description: String
        image: String
        status: String  
        date: String
        time: String
        userId: String
        poleId: String
    }

    type Message {
        _id: ID!
        user: User!
        complaint: Complaint!
        date: String!
        time: String!
        content: String!
    }

    input MessageInput {
        userId: String!
        complaintId: String!
        date: String!
        time: String!
        content: String!
    }

    type RootQuery {
        users(userId: String, email: String): [User!]!
        poles(poleId: String): [Pole!]!
        complaints(complaintId: String, userId: String, poleId: String): [Complaint!]!
        messages(complaintId: String): [Message!]!
    }

    type RootMutation {
        createUser(userInput: UserInput): User
        createPole(poleInput: PoleInput): Pole
        createComplaint(complaintInput: ComplaintInput): Complaint
        updateComplaint(complaintId: String, complaintInput: ComplaintInput): [Complaint!]!
        createMessage(messageInput: MessageInput): Message
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }`
);
