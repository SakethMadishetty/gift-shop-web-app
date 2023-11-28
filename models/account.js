var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

// var Account = new Schema({});
const Account = new Schema({
    username: String,
    email: String,
    phone: String,
    address: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
