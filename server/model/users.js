const mongoose = require('../db/mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
  email: {
    type: String,
    minLength: 5,
    trim: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minLength: 5,
    required: true
  },
  token: {
    type: String
  }
})
function generateToken(id) {
  console.log('the id we are using is', id);
  var token = jwt.sign({ _id: id.toHexString() }, 'abc123').toString();
  return token;
}

async function findByToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, 'abc123')
  } catch (e) {
    return Promise.reject();
  }


  var response = UserModel.findOne({
    '_id': decoded._id,
    token
  });
  return response;
}

async function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);
  console.log('hashed :', hashed);
  return hashed;
};



function findByCredentials(email, password) {
   return UserModel.findOne({ email }).then((result) => {
    if (!result) {
      Promise.reject();

    } else {
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, result.password, (err, res) => {
          if (res) {
            resolve(result)
          } else {
            reject();
          }
        })
      })

    }
  })
}

function removeToken(token){
 return UserModel.update({
    $unset : {token}
    })
}

const UserModel = mongoose.model('User', userSchema);
module.exports = { UserModel, generateToken, findByToken, hashPassword, findByCredentials, removeToken}