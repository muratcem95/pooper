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
    var user = new User({
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
    
    Poop.find({_creator: session._id}).then((poops) => {
        
        console.log(session);
        
        res.render('home/home.html', {session, poops});
    }).catch((e) => res.send(e));
});

app.post('/profileImageUploadForm', (req, res) => {
    var session = req.session.user;
    
    if(req.files) {
        var file = req.files.filename,
            filename = file.name;
        file.mv("views/images/profileImages/"+filename,function(err) {
            if(err) {
                res.send(err);
            } else {   
                var fns = JSON.stringify(filename);
                var fn = JSON.parse(fns);
                
                console.log(fns);
                console.log(fn);
                
                User.findByIdAndUpdate({
                    _id: session._id
                }, { 
                    $set: { 
                        profileImage: fn
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
        location: "Will figure this out.",
        _creator: session._id
    });
    poop.save().then(() => res.redirect('/home')).catch((e) => res.send(e));
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