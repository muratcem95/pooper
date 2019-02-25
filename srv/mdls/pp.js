const mng = require('mng');

var mngS = mng.Schema;

const PpSch = new mngS({
    dsc: {
        type: String,
        trim: true,
        default: null
    },
    stDt: {
        type: String
    },
    loc: {
        type: String
    },
    cmnts: {
        type: Array,
        default: []
    },
    cmntsLg: {
        type: Number,
        default: 0
    },
    _crtr: {
        type: mngS.Types.ObjectId,
        ref: 'usrs'
    }
});

const Pp = mng.model('pps', PpSch);

module.exports = {Pp};