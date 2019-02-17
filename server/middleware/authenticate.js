const session = require('client-sessions');

const {User} = require('./../models/user');

var authenticateUser = (req, res, next) => {
    if (req.session && req.session.user) { 
        User.findById({ _id: req.session.user._id }, function (err, user) {
            if(user) {
                req.user = user;
                delete req.user.password; 
                req.session.user = user;
                res.locals.user = user;
            };
            next();
        });
    } else {
        res.redirect('/mainPage');
        next();
    };
};

module.exports = {authenticateUser};