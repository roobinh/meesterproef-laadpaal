
const User = require('./models/user')
const Pole = require('./models/pole')
const Complaint = require('./models/complaint')

const user = async userId => {
    try {
        const user = await User.findById(userId);
        if(!user) {
            console.log("User == null!");
        }
        console.log(user);
        return {
            ...user._doc,
            _id: user.id,
        };
    } catch(err) {
        throw err
    }
} 

const pole = async poleId => {
    try {
        const pole = await Pole.findById(poleId);
        return {
            ...pole._doc,
            _id: pole.id
        };
    } catch(err) {
        throw err
    }
}

module.exports = {

    users: async args => {
        console.log(args);
        if(args.userId)     // return specific user 
        {          
            try {
                const users = await User.find({ _id: { $in: args.userId } });
                return users.map(user => {
                    return {
                        ...user._doc,
                        _id: user.id,
                    };
                });
            } catch(err) {
                throw err
            }
        } else              // return all users
        {           
            try {
                const users = await User.find();
                return users.map(user => {
                    return {
                        ...user._doc,
                        _id: user.id,
                    };
                });
            } catch(err) {
                throw err
            }
        }        
    },

    createUser: async args => {
        const user = new User({
            number: args.userInput.number,
            email: args.userInput.email,
            name: args.userInput.name,
            points: args.userInput.points
        });

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
    
    poles: async() => {
        try {
            const poles = await Pole.find()
            return poles.map(pole => {
                return {
                    ...pole._doc,
                    _id: pole.id,
                };
            });
        } catch(err) {
            throw err
        }
    },

    createPole: async args => {
        const pole = new Pole({
            longitude: args.poleInput.longitude,
            latitude: args.poleInput.latitude,
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

    complaints: async args => {
        console.log(args)
        try {
            const complaints = await Complaint.find();
            return complaints.map(complaint => {
                console.log(complaint);
                return {
                    ...complaint._doc,
                    _id: complaint.id,
                    user: user.bind(this, complaint._doc.user),
                    pole: pole.bind(this, complaint._doc.pole)
                };
            });
        } catch (err) {
            throw err
        }
    },

    createComplaint: async args => {
        const complaint = new Complaint({
            type: args.complaintInput.type,
            description: args.complaintInput.description,
            image: args.complaintInput.image,
            status: args.complaintInput.status,
            date: args.complaintInput.date,
            user: args.complaintInput.userId.toString(),
            pole: args.complaintInput.poleId.toString()
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