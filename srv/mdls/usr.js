const mng = require('mng');
const vld = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcr = require('bcryptjs');

const UsrSch = new mng.Schema({
    pi: {
        type: String,
        trim: true,
        default: null
    },
    nm: {
        type: String,
        trim: true,
        required: true
    },
    usrNm: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    em: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: vld.isEmail,
            message: '{VALUE} is not an email'
        }
    },
    ph: {
        type: Number,
        trim: true,
        default: null
    },
    pw: {
        type: String,
        required: true,
        minlength: 6
    },
    snUpDt: {
        type: String
    },
    tks: [{
        acs: {
            type: String,
            required: true,        
        },
        tk: {
            type: String,
            required: true,
        }
    }]
});

UsrSch.methods.toJSON = function() {
    var usr = this;
    
    var usrObj = usr.toObject();
    return _.pick(usrObj, ['_id', 'em']);
};

UsrSch.methods.gnAuthTk = function() {
    var usr = this;
    
    var acs = 'auth';
    var tk = jwt.sign({_id:usr._id.toHexString(), access}, 'abc123').toString();
    
    if(usr.tks.length === 0) {
        usr.tks = usr.tks.concat([{acs, tk}]);
    };
    
    return usr.save().then(() => {
        return tk;
    });
};

UsrSch.methods.rmvTk = function(tk) {
    var usr = this;
    
    return usr.update({
        $pull: {
            tks: {tk}
        }
    });
};

UsrSch.statics.fndByTk = function(tk) {
    var Usr = this;
    
    try {
        var dec = jwt.verify(tk, 'abc123');
    } catch(e) {
        Promise.reject();
    };
    
    return Usr.findOne({
        _id: dec._id,
        'tks.acs': 'auth',
        'tks.tk': tk
    });
};

UsrSch.statics.fndByCrd = function(em, pw) {
    var Usr = this;
    
    return Usr.findOne({em}).then((usr) => {
        if(!usr) {
            return console.log('The email can not be found.');
        };
        
        return new Promise((resolve, reject) => {
            bcr.compare(pw, usr.pw, (e, res) => {
                if(res) {
                    resolve(usr);
                } else {
                    reject();
                };
            });
        });
    });
};

UsrSch.pre('save', function(next) {
    var usr = this;
    
    if(usr.isModified('pw')) {
        bcr.genSalt(10, (e, salt) => {
            bcr.hash(usr.pw, salt, (e, hash) => {
                usr.pw = hash;
                next();
            });
        });
    } else {
        next();
    };
});

const Usr = mng.model('usrs', UsrSch);

module.exports = {Usr};