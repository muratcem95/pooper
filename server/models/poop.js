const mongoose = require('mongoose');

const PoopSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        default: null
    },
    startDate: {
        type: Date
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    location: {
        type: String
    },
    comments: {
        type: Array,
        default: []
    },
    commentLength: {
        type: Number,
        default: 0
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

const Poop = mongoose.model('poops', PoopSchema);

module.exports = {Poop};