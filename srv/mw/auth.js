const ss = require('client-sessions');

const {Usr} = require('./../models/usr');

var authUsr = (req, res, next) => {
    if (req.ss && req.ss.usr) { 
        Usr.findById({ _id: req.ss.usr._id }, function (err, usr) {
            if(usr) {
                req.usr = usr;
                delete req.usr.pw; 
                req.ss.usr = usr;
                res.locals.usr = usr;
            };
            next();
        });
    } else {
        res.redirect('/mp');
        next();
    };
};

module.exports = {authUsr};