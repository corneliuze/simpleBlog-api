const mongoose = require('../db/mongoose');
const jwt = require('jsonwebtoken');

var userSchema = mongoose.Schema({
    username :{
        type: String,
        minLength : 5,
        trim: true,
        required : true,
        unique : true
    },
    email:{
        type: String,
        minLength : 5,
        trim: true,
        unique: true,
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

  async function findByToken(token){
    let decoded;
    try{
      decoded = jwt.verify(token, 'abc123')
    }catch(e){
       return Promise.reject();
    }


    var response = UserModel.findOne({
        '_id' : decoded._id,
        token
    });
    return response;
    


  }

const UserModel =  mongoose.model('User', userSchema);
module.exports ={ UserModel, generateToken, findByToken}