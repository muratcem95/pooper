const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        trim: true,
        default: null
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not an email'
        }
    },
    phone: {
        type: Number,
        trim: true,
        default: null
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    signUpDate: {
        type: Date
    },
    tokens: [{
        access: {
            type: String,
            required: true,        
        },
        token: {
            type: String,
            required: true,
        }
    }]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    
    var access = 'auth';
    var token = jwt.sign({_id:user._id.toHexString(), access}, 'abc123').toString();
    
    if(user.tokens.length === 0) {
        user.tokens = user.tokens.concat([{access, token}]);
    };
    
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var user = this;
    
    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    
    try {
        var decoded = jwt.verify(token, 'abc123');
    } catch(e) {
        Promise.reject();
    };
    
    return User.findOne({
        _id: decoded._id,
        'tokens.access': 'auth',
        'tokens.token': token
    });
};

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;
    
    return User.findOne({email}).then((user) => {
        if(!user) {
            return console.log('The email can not be found.');
        };
        
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (e, res) => {
                if(res) {
                    resolve(user);
                } else {
                    reject();
                };
            });
        });
    });
};

UserSchema.pre('save', function(next) {
    var user = this;
    
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (e, salt) => {
            bcrypt.hash(user.password, salt, (e, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    };
});

const User = mongoose.model('users', UserSchema);

module.exports = {User};