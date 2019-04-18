const express = require('express');
const BodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const {PostModel, findByTag} = require('./model/posts');
const {ObjectID} = require('mongodb');
const multer = require('multer');
const cloudinary = require('cloudinary');
const fs = require('fs');
const Response = require('./model/response');
const {generateToken, UserModel, findByToken } = require('../server/model/users');

const app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended : false}));

cloudinary.config({
  cloud_name: 'connie19',
  api_key: '159792258632524',
  api_secret: 'KTHJySZQczjhgjCF1szYcoFuNp8'
});



  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })

const upload = multer({ storage}).single('image');


//home route
app.get('/', (req, res) =>{
    res.send('welcome to the Blog app ');
});





app.post('/users/signup',  (req, res)=>{

   


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


app.post('/users/login', (req, res) =>{

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

   //route to post a blogpost
   app.post('/posts', upload,  (req, res) =>{
    console.log('the file from multer', req.file);
    const path = req.file.path;
 
    cloudinary.uploader.upload(path, (data) => {
       console.log('file uploaded to cloudinary', path)
       fs.unlinkSync(path);
       console.log('the file from cloudinary is', data)

    const imageUrl = req.body.data.url;
    console.log('the url i want to save is', imageUrl);
    const {tag, title, story, author} = req.body;
    if(!title || !story ){
      const message = new Response(400, 'Ensure all the required fields are filled', res, true, []);
      return message.response_message();
    }
   
    PostModel.create({
      tag,
      title,
      imageUrl,
      story,
      author
      }).then((data) =>{
     console.log(data);
      const savedBlogPost = new Response(200, 'post saved successfully', res, false, data);
      return savedBlogPost.response_message();

    }).catch(() =>{
      const unSavedBlogPost = new Response(400, 'unable to save post', res, true, [] );
      unSavedBlogPost.response_message();
    });
     
      }
    )
 
    
    
  });

  //route to get all posts
  app.get('/posts', (req, res) =>{
    PostModel.find().then((blogPost) =>{
      const resultFromGet = new Response(200, 'blog posts are generated successfully', res, false, blogPost);
      return resultFromGet.response_message();

    }).catch(()=>{
      const error = new Response(400, 'unable to get post', res, true, []) 
      return error.response_message();

    })

  });

//route to update post
  app.patch('/post:id', (req, res) =>{
    const id = req.params._id;

  });

  //route to get a particular post
  app.get('post:id', (req, res) =>{
    const id = req.params._id;
    if(!ObjectID.isValid(id)){
      // do something
  }
  PostModel.findById(id).then((result) =>{
    if(!result){
      const nullResult = new Response(data._id, data.tag, data.title, data.imageUrl, data.story, data.author, data.completedAt);
      nullResult.response_message();

    }else{
      const resultMessage = new Response(data._id, data.tag, data.title, data.imageUrl, data.story, data.author, data.completedAt);
      return resultMessage.response_message();
    }
  }).catch(() =>{

  });

  });

  //route to get post based on tags
  app.get('/post:tag', (req, res) => {
    let tag = req.params.tag;
    PostModel.findByTag(tag).then((response) => {
    if(!response){
      const noResponse = new Response(400, 'No post found', res, true,  
      data._id, data.tag, data.title, data.imageUrl, data.story, data.author, data.completedAt);
      noResponse.response_message();
    }else{
      const mResponse = new Response(200, 'these are the post based on this tag', res, false, 
      data._id, data.tag, data.title, data.imageUrl, data.story, data.author, data.completedAt);
      mResponse.response_message();
    }
    
  })
  })

  //route to delete post
  app.delete('/post:id', (req, res) =>{
    let id = req.params._id;
  if(!ObjectID.isValid(id)){
   // do something
  }
  PostModel.findByIdAndRemove(id).then(() =>{
    if(!post){
 // do something
    }
  var deletedPost = new Response(200, `${id} is deleted`, res, false, {todo});
  deletedPost.response_message(data._id, data.tag, data.title, data.imageUrl, data.story, data.author, data.completedAt);
  }).catch(() =>{

  })

  });






app.on('listening', ()=>{
  console.log('server started on port' );
});

app.listen(1300)

module.exports = app