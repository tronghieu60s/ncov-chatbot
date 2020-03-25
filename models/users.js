const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const USER = new Schema({
    sender_psid: String,
    date: Date
}, { collection: 'USERS' });
const MyModel = mongoose.model('USERS', USER);

module.exports = MyModel;