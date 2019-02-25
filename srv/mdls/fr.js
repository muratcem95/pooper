const mng = require('mng');

var mngS = mng.Schema,
    oi = mngS.Types.ObjectId;

const FrSch = new mngS({
    _me: {
        type: oi,
        ref: 'usrs'
    },
    _fr: {
        type: oi,
        ref: 'usrs'
    }
});

const Fr = mng.model('frs', FrSch);

module.exports = {Fr};