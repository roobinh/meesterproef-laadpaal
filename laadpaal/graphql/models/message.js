const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const messageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    complaint: {
        type: Schema.Types.ObjectId,
        ref: 'Complaint'
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Message', messageSchema);