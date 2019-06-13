const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const poleSchema = new Schema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    city : {
        type: String,
        required: false
    },
    region: {
        type: String,
        required: false
    },
    regioncode: {
        type: String,
        required: false
    },
    district: {
        type: String,
        required: false
    },
    subdistrict: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    postalcode: {
        type: String,
        required: false
    },
    provider: {
        type: String,
        required: false
    },
    sockets: {
        type: Number,
        required: false
    },
    usedsockets: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('Pole', poleSchema);