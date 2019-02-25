//CONNECTIVITY SETUP
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const hbs = require('hbs');
const socketIO = require('socket.io');
const moment = require('moment');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const upload = require('express-fileupload');

const {mongoose} = require('./db/mongoose');
const {authenticateUser} = require('./middleware/authenticate');
const {User} = require('./models/user');
const {Poop} = require('./models/poop');
const {Friend} = require('./models/friend');
const {CommentNotification} = require('./models/commentNotification');

const viewsPath = path.join(__dirname, '../views');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'muratcem95@gmail.com',
        pass: 'hqkjctddswrplwjm'
    }
});

app.set('views', viewsPath);  
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.get('/', (req, res) => {
    res.redirect('/mainPage');
});

app.use(express.static(viewsPath));
app.use(session({
    cookieName: 'session',
    secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
    duration: 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));
app.use(upload());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());







/////////////////////////////////////////////////////////////////////////////////////////////////////
//MAIN PAGE 
app.get('/mainPage', (req, res) => {
    res.sendFile('mainPage/index.html');
});






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//USER
app.post('/signUp', (req, res) => {
    var user = new User ({
        name: req.body.name,
        userName: req.body.userName,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        signUpDate: moment()
    });
    user.save().then(() => {
        req.session.user = user;
        user.generateAuthToken();
        
        res.redirect('/home');
    }).catch((e) => res.send(e));
});

app.post('/logIn', (req, res) => {
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        req.session.user = user;
        user.generateAuthToken();
        
        res.redirect('/home');
    }).catch((e) => res.send(e));
});

app.get('/logOut', authenticateUser, (req, res) => {
    req.session.user.removeToken(req.session.user.tokens[0].token).then(() => {
        req.session.reset();
        
        res.redirect("/mainPage");
    }).catch((e) => res.send(e));
});

app.get('/home', authenticateUser, (req, res) => {
    var session = req.session.user; 
    
    Friend.find({_myself: session._id}).then((friends) => {
        var friendsArray = [];
        
        for(var i=0;i<friends.length;i++) {
            friendsArray.push(friends[i]._friend);
        };
        
        Poop.find({_creator: {$in: friendsArray}}).sort('-startDate').populate('_creator').then((poops) => {
            CommentNotification.find({pooperId: session._id}).populate('poopId').populate('commenterId').sort('-commentDate').then((commentNotifications) => {
                console.log(commentNotifications);
                var commentNotificationsLength = commentNotifications.length;
                
                res.render('home/home.html', {session, poops, commentNotifications, commentNotificationsLength});
            }).catch((e) => res.send(e));
        }).catch((e) => res.send(e));
    }).catch((e) => res.send(e));
});

app.post('/commentNotificationsDeleteForm', authenticateUser, (req, res) => {
    CommentNotification.findByIdAndDelete({_id: req.body.commentId}).then(() => res.redirect('home')).catch((e) => res.send(e));
});

app.post('/profileImageUploadForm', authenticateUser, (req, res) => {
    if(req.files) {
        var PIObject = req.files.PI;
        var profileImage = PIObject.name;
                
        PIObject.mv(`views/images/profileImages/${profileImage}`, function(err) {
            if(err) {
                res.send(err);
            } else {    
                var session = req.session.user;
                
                User.findByIdAndUpdate({
                    _id: session._id
                }, { 
                    $set: { 
                        profileImage
                    }
                }, {
                    new: true
                }).then(() => res.redirect('/home')).catch((e) => res.send(e));
            };
        });
    };
});

app.post('/newPoopForm', authenticateUser, (req, res) => {
    var session = req.session.user;
    
    var poop = new Poop ({
        description: req.body.description,
        startDate: moment(),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        location: req.body.location,
        _creator: session._id
    });
    poop.save().then().catch((e) => res.send(e));
});

app.post('/commentForm', authenticateUser, (req, res) => {
    var session = req.session.user;
    
    var comments = {
        poopProfileImage: req.body.poopProfileImage,
        comment: req.body.comment, 
        commentUserName: req.body.poopUserName, 
        commentDate: new Date()
    };
    
    Poop.findByIdAndUpdate({
        _id: req.body.poopId
    }, {
        $push: {
            comments,
        },
        $inc: { 
            commentLength: 1 
        }
    }, {
        new: true
    }).then(() => {
        var commentNotification = new CommentNotification({
            poopId: req.body.poopId,
            pooperId: req.body.pooperId,
            commenterId: session._id,
            comment: req.body.comment,
            commentDate: new Date()
        });
        commentNotification.save().then(() => res.redirect('/home')).catch((e) => res.send(e));
    }).catch((e) => res.send(e));
});

app.post('/searchFriends', authenticateUser, (req, res) => {
    var session = req.session.user;
    
    User.find({userName: req.body.searchUserName}).then((friend) => {
        Poop.find({_creator: friend[0]._id}).populate('_creator').sort('-startDate').then((poops) => {
            Friend.find({_myself: session._id}).then((friendList) => {
                if (JSON.stringify(friend[0]._id) === JSON.stringify(session._id)) {
                    var myself = true;
                    res.render('search/search.html', {session, poops, friend, myself});
                } else {
                    if(friendList.length === 0) {
                        res.render('search/search.html', {session, poops, friend});
                    } else {
                        var repeat = [];
                        for(var i=0;i<friendList.length;i++) {
                            if (JSON.stringify(friendList[i]._friend) === JSON.stringify(friend[0]._id)) {
                                repeat.push(true);
                            } else {
                                repeat.push(false);
                            };
                        };
                        var repeatBoolean = repeat.includes(true);

                        res.render('search/search.html', {session, poops, friend, repeatBoolean});
                    };
                };
            }).catch((e) => res.send(e));    
        }).catch((e) => res.send(e));
    }).catch((e) => res.send(e));
});

app.post('/addFriend', authenticateUser, (req, res) => {
    var session = req.session.user;
    
    var friend = new Friend ({
        _myself: session._id,
        _friend: req.body.friendId
    });
    friend.save().then(() => {
        var friend2 = new Friend({
            _myself: req.body.friendId,
            _friend: session._id
        });
        friend2.save().then(() => res.redirect('/home')).catch((e) => res.send(e));
    }).catch((e) => res.send(e));
});







////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//IO CONNECTIONS
io.on('connection', (socket) => {
    console.log('New user connected.');
    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});
    
server.listen(port, () => console.log(`Server is up on port ${port}`));