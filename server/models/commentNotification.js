const mongoose = require('mongoose');

const CommentNotificationSchema = new mongoose.Schema({
    poopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'poops'
    },
    pooperId: {
        type: String
    },
    commenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    comment: {
        type: String
    },
    commentDate: {
        type: Date
    }
});

const CommentNotification = mongoose.model('commentNotifications', CommentNotificationSchema);

module.exports = {CommentNotification};