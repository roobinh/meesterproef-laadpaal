const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const complaintSchema = new Schema({
    type: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    pole: {
        type: Schema.Types.ObjectId,
        ref: 'Pole'
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);