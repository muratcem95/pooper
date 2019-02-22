const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    _myself: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    _friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

const Friend = mongoose.model('friends', FriendSchema);

module.exports = {Friend};