const mongoose = require('../db/mongoose');
const jwt = require('jsonwebtoken');

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
function generateToken (id){
    console.log('the id we are using is', id);
    var token = jwt.sign({_id : id.toHexString()}, 'abc123').toString();
    return token;
  }

const UserModel =  mongoose.model('User', userSchema);
module.exports ={ UserModel, generateToken}