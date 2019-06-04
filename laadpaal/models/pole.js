const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const poleSchema = new Schema({
    longitude: {
        type: Schema.Types.Number,
        required: false
    },
    latitude: {
        type: Schema.Types.Number,
        required: false
    },
    chargetype: {
        type: String,
        required: false
    },
    power: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
});

module.exports = mongoose.model('Pole', poleSchema);