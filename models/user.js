/**
 * Created by zjw on 2016/12/27.
 */
var mongoose = require("../lib/mongo.js");

var userSchema = mongoose.Schema({
    name: {type: String, unique: true},
    password: {type: String},
    avatar: {type: String},
    gender: {type: String},
    bio: {type: String}
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;
