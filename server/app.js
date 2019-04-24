const express = require('express');
const BodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const PostModel = require('./model/posts');
const _ = require('lodash');
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
     const ok = await UserModel.findOne({_id : userResponse._id});
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
   const token = req.header('x-auth');
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
       fs.unlinkSync(path);
       console.log('the file from cloudinary is', data)

    const imagepath = data.url;
    const completedAt = new Date().getTime();
    console.log('the array of tags are', typeof req.body.tags);

      PostModel.create({
      title : req.body.title,
      story: req.body.story,
      imageUrl: imagepath,
      completedAt
      }).then((data) =>{
     console.log('the post saved is',data);
     console.log('the title is', data.title);
  
      const savedBlogPost = new Response(200, 'post saved successfully', res, false, data);
      return savedBlogPost.response_message();
     
    }).catch((err) =>{
      console.log('error from saving post', err)
      const unSavedBlogPost = new Response(400, 'unable to save post', res, true, [] );
      unSavedBlogPost.response_message();
    });
     });
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
  app.patch('/post/:id', (req, res) =>{
    const id = req.params._id;
    const body = _.pick(req.body, ['tags', 'title','imageUrl','story', 'author'])

    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }

    PostModel.findByIdAndUpdate(id, {$set : body}, {new: true}).then((blog), () =>{
      if(!blog){
        return res.status(404).send();
      }
      res.send(body);

    }).catch((e) =>{
      console.log('error', e)
      return res.status(400).send();

    });

  });

  //route to get a particular post
  app.get('/posts/:id', (req, res) =>{
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
      console.log('the id for this post is', id);
      // do something
      const noValidId = new Response(400, 'no post with this id is found', res, true, []);
      noValidId.response_message();
  }
  PostModel.findById(id).then((posts) =>{
    if(!posts){
      console.log('the result is not ',posts);
     res.status(400).send();

    }else{
      console.log('the result is',posts);
      res.send({posts});
      
    }
  }).catch((err) =>{
    console.log('error getting the blog post by id', err);
    const errorMessage = new Response(400, 'error finding blog post', res, true, err);

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
  app.delete('/post/:id', (req, res) =>{
    let id = req.params.id;
    console.log('the id of the item we want to delete', id);
  if(!ObjectID.isValid(id)){
     return res.status(400).send();
  }
  PostModel.findByIdAndRemove(id).then((post) =>{
    if(!post){
     res.status(404).send();
    }
    res.status(200).send({post})
  }).catch((e) =>{
    console.log('the error while deleting', e);
    res.status(404).send(e);

  })

  });






app.on('listening', ()=>{
  console.log('server started on port' );
});

app.listen(3006)

module.exports = app