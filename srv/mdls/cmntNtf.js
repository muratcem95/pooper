const mng = require('mng');

var mngS = mng.Schema,
    oi = mngS.Types.ObjectId;

const CmntNtfSch = new mngS({
    _pp: {
        type: oi,
        ref:'pps'
    },
    _ppCrtr: {
        type: oi,
    },
    _cmntr: {
        type: oi,
        ref: 'usrs'
    },
    cmnt: {
        type: String
    },
    cmntDt: {
        type: String
    }
});

const CmntNtf = mng.model('cmntNtfs', CmntNtfSch);

module.exports = {CmntNtf};