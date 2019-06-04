const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const complaintSchema = new Schema({
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Pole: {
        type: Schema.Types.ObjectId,
        ref: 'Pole',
        required: true
    },
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
});

module.exports = mongoose.model('Complaint', complaintSchema);