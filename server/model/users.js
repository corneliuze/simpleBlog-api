const mongoose = require('../db/mongoose');

var userSchema = mongoose.Schema({
    username :{
        type: String,
        minLength : 5,
        trim: true,
        required : true
    },
    email:{
        type: String,
        minLength : 5,
        trim: true,
        required : true
    },
    password :{
        type: String,
        minLength : 5,
        required : true
    },
    token:{
        type: String
    }
})

module.exports = UserModel