const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const userSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: false
    },
    points: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('User', userSchema);