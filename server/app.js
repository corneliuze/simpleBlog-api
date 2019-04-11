const express = require('express');
const BodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const PostModel = require('./model/posts');
const {ObjectID} = require('mongodb');
const multer = require('multer');
const {generateToken, UserModel, findByToken } = require('../server/model/users');

const app = express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended : false}));

const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, './upload')
  },
  filename : function(req, file, cb){
      cb(null, new Date().toISOString() + file.originalname);
  }
})
const upload = multer({
  storage : storage,
  limits :{ 
  filesize : 1024 * 1024 * 5
}});


//home route
app.get('/', (req, res) =>{
    res.send('welcome to the Blog app ');
});


//route to post a todo
app.post('/posts', upload.single('imageUrl'),  (req, res) =>{
  // let time = new Date().getTime();
  var post = new PostModel({
    title : req.body.title,
    imageUrl : req.file.path,
    story : req.body.story,
    
    });
  post.save().then((blogPost) =>{
    res.send(blogPost);
  }).catch((e) =>{
    res.status(401).send(e);
  });
});

app.post('/users', (req, res)=>{
   UserModel.create({
    username : req.body.username,
    email : req.body.email,
    password : req.body.password
  }).then( async(userResponse) =>{
    console.log('user response', userResponse);
     const token =generateToken(userResponse._id);
     console.log('token is', token)
     var ok = await UserModel.findOne({_id : userResponse._id});
     ok.token = token;
     ok.save().then(() =>{
      return res.header('x-auth' , token).send({
        data : userResponse,
        id : userResponse._id,
        message : 'user saved succesfully',
        token 
      });

     });
     
    }).catch((e) =>{
      res.send({
        message : 'unable to save',
        error : e
      });
    });
});

app.get('/users/me',(req, res) =>{
   var token = req.header('x-auth');
   findByToken(token).then((response) =>{
     if(!response){
       Promise.reject();
     }
     res.send(response);
   }).catch((e) =>{
     res.status(401).send(e);
   });
   

});




app.listen(5000, ()=>{
  console.log('server started on port', 5000);
});

module.exports = app