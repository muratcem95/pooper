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
    location: {
        type: String
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

const Poop = mongoose.model('poops', PoopSchema);

module.exports = {Poop};