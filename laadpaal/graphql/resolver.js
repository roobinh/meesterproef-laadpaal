
const User = require('./models/user')
const Pole = require('./models/pole')
const Complaint = require('./models/complaint')
const Message = require('./models/message')

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

const complaint = async complaintId => {
    try {
        const complaint = await Complaint.findById(complaintId);
        return {
            ...complaint._doc,
            _id: complaint.id
        }
    } catch(err) {
        throw err
    }
}

module.exports = {
    users: async args => {
        if(args.email) {    // return specific user
            try {
                const users = await User.find({ email: { $in: args.email } });
                return users.map(user => {
                    return {
                        ...user._doc,
                        _id: user.id,
                    };
                });
            } catch(err) {
                throw err
            }
        } else if(args.userId)     // return specific user 
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
        args.userInput.points ? points = args.userInput.points : points = 0;
        // args.userInput.number ? number = args.userInput.number : number = "0";

        const user = new User({
            number: args.userInput.number,
            email: args.userInput.email,
            name: args.userInput.name,
            points: points
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
    
    poles: async args => {
        if(args.poleId) 
        {
            try {
                const poles = await Pole.find({ _id: { $in: args.poleId } });
                return poles.map(pole => {
                    return {
                        ...pole._doc,
                        _id: pole.id,
                    };
                });
            } catch(err) {
                throw err
            }
        } else 
        {
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
        }
        
    },

    createPole: async args => {
        const pole = new Pole({
            longitude: args.poleInput.longitude,
            latitude: args.poleInput.latitude,
            city: args.poleInput.city,
            region: args.poleInput.region,
            regioncode: args.poleInput.regioncode,
            district: args.poleInput.district,
            subdistrict: args.poleInput.subdistrict,
            address: args.poleInput.address,
            postalcode: args.poleInput.postalcode,
            provider: args.poleInput.provider,
            sockets: args.poleInput.sockets,
            usedsockets: args.poleInput.usedsockets
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
        if(args.userId)
        {
            try {
                const complaints = await Complaint.find({ user: { $in: args.userId } });
                return complaints.map(complaint => {
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
        } else if(args.complaintId) 
        {
            try {
                const complaints = await Complaint.find({ _id: { $in: args.complaintId } });
                return complaints.map(complaint => {
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
        } else if(args.poleId) 
        {
            try {
                const complaints = await Complaint.find({ pole: { $in: args.poleId } });
                return complaints.map(complaint => {
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
        } else 
        {
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
        }        
    },

    createComplaint: async args => {
        const complaint = new Complaint({
            type: args.complaintInput.type,
            description: args.complaintInput.description,
            image: args.complaintInput.image,
            status: args.complaintInput.status,
            date: args.complaintInput.date,
            time: args.complaintInput.time,
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
    },

    updateComplaint: async args => {

        const complaints = await Complaint.find({ _id: { $in: args.complaintId } });
        
        return complaints.map(complaint => {

            if(args.complaintInput.type) {
                complaint.type = args.complaintInput.type;
            }

            if(args.complaintInput.image) {
                complaint.image = args.complaintInput.image;
            }

            if(args.complaintInput.status) {
                complaint.status = args.complaintInput.status;
            }

            if(args.complaintInput.date) {
                complaint.date = args.complaintInput.date;
            }

            if(args.complaintInput.description) {
                complaint.description = args.complaintInput.description;
            }

            if(args.complaintInput.userId) {
                complaint.user = args.complaintInput.userId.toString();
            }

            if(args.complaintInput.poleId) {
                complaint.pole = args.complaintInput.poleId.toString();
            }

            return complaint   
                .save()
                .then(result => {
                    console.log(result) 
                    return { ...result._doc }
                }).catch(err => {
                    console.log(err)
                    throw err;
                })
        })
    },

    messages: async args => {
        console.log('kutgraphql')
        if(args.complaintId) 
        {
            try {
                const messages = await Message.find({ complaint: { $in: args.complaintId }});
                return messages.map(message => {
                    return {
                        ...message._doc,
                        _id: message.id,
                        complaint: complaint.bind(this, message._doc.complaint),
                        user: user.bind(this, message._doc.user)
                    }
                })
            } catch (err) {
                throw err
            }
        } else 
        {
            try {
                const messages = await Message.find();
                return messages.map(message => {
                    console.log(message);
                    return {
                        ...message._doc,
                        _id: message.id,
                        complaint: complaint.bind(this, message._doc.complaint),
                        user: user.bind(this, message._doc.user)
                    }
                })
            } catch(err) {
                throw err;
            }
        }
    },

    createMessage: async args => {
        console.log("faka");

        const message = new Message({
            user: args.messageInput.userId.toString(),
            complaint: args.messageInput.complaintId.toString(),
            date: args.messageInput.date,
            time: args.messageInput.time,
            content: args.messageInput.content
        })

        return message
            .save()
            .then(result => {
                console.log(result)
                return { ...result._doc }
            }).catch(err => {
                console.log(err)
                throw err;
        })
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