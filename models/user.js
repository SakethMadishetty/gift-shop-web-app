const mongoose = require('mongoose');
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: String,
    email: String,
    mobile: String,
    isAdmin: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
