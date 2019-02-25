const mng = require('mongoose');

mng.set('useCreateIndex', true);
mng.Promise = global.Promise;
mng.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ppr', {useNewUrlParser: true});

module.exports = {mng};