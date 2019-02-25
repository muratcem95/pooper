const path=require('path');
const http=require('http');
const exp=require('express');
const bp=require('body-parser');
const ss=require('client-sessions');
const hbs=require('hbs');
const sIO=require('socket.io');
const mmnt=require('moment');
const {ObjID}=require('mongodb');
const _=require('lodash');
const mlr=require('nodemailer');
const upl=require('express-fileupload');
const {mng}=require('./db/mng');
const {authUsr}=require('./mw/auth');
const {Usr}=require('./mdls/usr');
const {Poop}=require('./mdls/poop');
const {Frnd}=require('./mdls/frnd');
const {CmntNtf}=require('./mdls/cmntNtf');
const vp=path.join(__dirname,'../vws');
const prt=process.env.PORT||3000;
const app=express();
const srv=http.createServer(app);
const io=sIO(srv);
const trns=mlr.createTransport({
    service:'gmail',
    auth:{
        user:'mckcodingprojects@gmail.com',
        pass:'Mc331329'
    }
});
app.set('vws',vp);  
app.set('view engine','html');
app.engine('html',require('hbs').__express);
app.get('/',(req,res)=>{
    res.redirect('/mp');
});
app.use(exp.static(vp));
app.use(ss({
    cookieName:'session',
    secret:'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
    duration:60*60*1000,
    activeDuration:5*60*1000,
    httpOnly:true,
    secure:true,
    ephemeral:true
}));
app.use(upl());
app.use(bp.urlencoded({extended:false}));
app.use(bp.json());

app.get('/mp',(req,res)=>{
    res.sendFile('mp/mp.html');
});
app.post('/snU',(req,res)=>{
    var rb=req.body,
        snUpDt=mmnt.format('llll'),
        usr=new Usr({
            nm:rb.nm,
            usrNm:rb.usrNm,
            em:rb.em,
            ph:rb.ph,
            pw:rb.pw,
            snUpDt
        });
    usr.save().then(()=>{
        req.ss.usr=usr;
        usr.genAuthTk();
        res.redirect('/hm');
    }).catch((e)=>res.send(e));
});
app.post('/lgI',(req,res)=>{
    var rb=req.body;
    Usr.fndByCrd(rb.em,rb.pw).then((usr)=>{
        req.ss.usr=usr;
        usr.gnAuthTk();
        res.redirect('/hm');
    }).catch((e) => res.send(e));
});
app.get('/lgO',authUsr,(req,res)=>{
    var rs=req.ss;
    rs.usr.rmvTk(rs.usr.tks[0].tk).then(()=>{
        rs.reset();
        res.redirect("/mp");
    }).catch((e)=>res.send(e));
});
app.get('/hm',authUsr,(req,res)=>{
    var ss = req.ss.usr; 
    Fr.find({
        _me:ss._id
    }).then((fr)=>{
        var frArr=[];
        for(var i=0;i<fr.length;i++){
            frArr.push(fr[i]._fr);
        };
        Pp.find({
            _creator:{
                $in:frArr
            }
        }).sort('-stDt').populate('_crtr').then((pp)=>{
            CmntNtf.find({
                _ppCrtr:ss._id
            }).populate('_pp').populate('_cmntr').sort('-cmntDt').then((cmntNtf)=>{
                var cmntNtfLg = cmntNtf.length;
                res.render('hm/hm.html',{ss,pp,cmntNtf,cmntNtfLg});
            }).catch((e)=>res.send(e));
        }).catch((e)=>res.send(e));
    }).catch((e)=>res.send(e));
});
app.post('/cmntNtfDlt',authUsr,(req,res)=>{
    CmntNtf.findByIdAndDelete({
        _id:req.body._cmnt
    }).then(()=>res.redirect('/hm')).catch((e)=>res.send(e));
});
app.post('/piUpl',authUsr,(req,res)=>{
    var rf=req.files,
        ss=req.ss.usr;
    if(rf){
        var piObj=rf.piU,
            pi=piObj.name;
        piObj.mv(`vws/img/pi/${pi}`,function(e){
            if(e){
                res.send(e);
            }else{    
                Usr.findByIdAndUpdate({
                    _id:ss._id
                },{ 
                    $set:{ 
                        pi
                    }
                },{
                    new:true
                }).then(()=>res.redirect('/hm')).catch((e)=>res.send(e));
            };
        });
    };
});
app.post('/newPp',authUsr,(req,res)=>{
    var ss=req.ss.usr,
        rb=req.body,
        stDt=mmnt.format('llll'),
        pp=new Pp({
            dsc:rb.description,
            stDt,
            lat:rb.lat,
            lng:rb.lng,
            loc:rb.loc,
            _crtr: ss._id
        });
    pp.save().then(()=>res.redirect('/hm')).catch((e)=>res.send(e));
});
app.post('/cmnt',authUsr,(req,res)=>{
    var ss=req.ss.usr,
        rb=req.body,
        cmntDt=mmnt.format('llll'),
        cmnts={
            _pp:rb._pp,
            cmntPi:rb.cmntPi,
            cmnt:rb.cmnt, 
            cmntUsrNm:rb.cmntUsrNm, 
            cmntDt
        };
    Pp.findByIdAndUpdate({
        _id:rb._id
    },{
        $push: {
            cmnts,
        },
        $inc: { 
            cmntsLg:1 
        }
    },{
        new: true
    }).then(()=>{
        var cmntNtf=new CmntNtf({
            _pp:rb._pp,
            _ppCrtr:rb._ppCrtr,
            _cmntr:ss._id,
            cmnt:rb.cmnt,
            cmntDt
        });
        cmntNtf.save().then(()=>res.redirect('/hm')).catch((e)=>res.send(e));
    }).catch((e)=>res.send(e));
});
app.post('/srch',authUsr,(req,res)=>{
    var ss=req.ss.usr,
        rb=req.body,
        fr0=fr[0]._id,
        frLiLg=frLi.length,
    Usr.find({
        usrNm:rb.usrNm
    }).then((fr)=>{
        Pp.find({
            _crtr:fr0
        }).populate('_crtr').sort('-stDt').then((pp)=>{
            Fr.find({
                _me:ss._id
            }).then((frLi)=>{
                if(JSON.stringify(fr0)===JSON.stringify(ss._id)){
                    var me=true;
                    res.render('srch/srch.html',{ss,pp,fr,me});
                }else{
                    if(frLiLg===0){
                        res.render('srch/srch.html',{ss,pp,fr});
                    }else{
                        var rpt=[];
                        for(var i=0;i<frLiLg;i++){
                            if(JSON.stringify(frLi[i]._fr)===JSON.stringify(fr0)){
                                rpt.push(true);
                            }else{
                                rpt.push(false);
                            };
                        };
                        var rptBoo=rpt.includes(true);
                        res.render('srch/srch.html',{ss,pp,fr,rptBoo});
                    };
                };
            }).catch((e)=>res.send(e));    
        }).catch((e)=>res.send(e));
    }).catch((e)=>res.send(e));
});
app.post('/addFr',authUsr,(req,res)=>{
    var ss=req.ss.usr,
        rb=req.body,
        fr=new Fr({
            _me:ss._id,
            _fr:rb._fr
        });
    fr.save().then(()=>{
        var fr2=new Fr({
            _me:rb._fr,
            _fr:ss._id
        });
        fr2.save().then(()=>res.redirect('/hm')).catch((e)=>res.send(e));
    }).catch((e)=>res.send(e));
});

io.on('connection', (socket) => {
    console.log('New user connected.');
    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});
    
srv.listen(prt, () => console.log(`Server is up on port ${prt}`));