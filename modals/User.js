const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.MONGOURI , {useNewUrlParser : true , useUnifiedTopology: true});

// Comments Not added yet
const userSchema = new mongoose.Schema({
    nickname : String,
    age : Number,
    displayPicture : String,
    googleId : String,
    email : String,
    avatar : String,
    blogID : [String],

});

const User = mongoose.model('user' , userSchema);
module.exports = {User};