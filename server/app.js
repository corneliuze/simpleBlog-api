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
const authenticate = require('./middleware/authenticate');
const json2csv = require('json2csv').parse;
const path = require('path');
const fields = ['title' , 'imageUrl' , 'story', 'author' , 'likes', 'dislikes']
const moment = require('moment');

const {generateToken, UserModel,  findByCredentials, hashPassword, removeToken } = require('../server/model/users');

const app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended : false}));

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_NAME,
  api_secret:process.env.CLOUD_NAME
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





app.post('/users/signup', async (req, res)=>{
  const hashedPassword = req.body.password;
  const password = await hashPassword(hashedPassword);
  UserModel.create({
    email : req.body.email,
    password
  }).then( async(userResponse) =>{
    console.log('user response', userResponse);
     const token =generateToken(userResponse._id);
     console.log('token is', token)
     const ok = await UserModel.findOne({_id : userResponse._id});
     ok.token = token;
     ok.save().then(() =>{
      return res.header('x-auth' , token).send({
        email : userResponse.email,
        id : userResponse._id,
        code: 200,
        error: false,
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


app.post('/users/login',  (req, res) =>{
const body = _.pick(req.body, ['email', 'password']);

findByCredentials(body.email, body.password).then(async (user) =>{
  console.log(user)
  console.log(body.email, body.password)
      const token = generateToken(user._id);
      console.log(token);
      const ok = await UserModel.findOne({_id : user._id});
      ok.token = token;
      ok.save().then(() =>{
        return res.header('x-auth', token).send({
          code: 200,
          error: false,
          token: token,
          message: 'user logged successfully',
          id : user.id,
          email : user.email
      })
    })
}).catch((e) =>{
  return res.status(404).send(e);
})



});

app.get('/users/me', authenticate,(req, res) =>{
     res.send(req.user);
});

  //route to post a blogpost findByCredentials(body.email, body.password).then(async (user) =>{
  app.post('/posts', upload,  (req, res) =>{
  console.log('the file from multer', req.file);
  const path = req.file.path;

    cloudinary.uploader.upload(path, (data) => {
      fs.unlinkSync(path);
      console.log('the file from cloudinary is', data)
      
const imagepath = data.url;
const completedAt = new Date().getTime();
  const tags = req.body.tags;
  // const tags = tagExpected.split(",")
  

  console.log('each of the tags : ', tags);


  console.log('the array of tags are', typeof req.body.tags);

    PostModel.create({
    tags,
    title : req.body.title,
    story: req.body.story,
    imageUrl: imagepath,
    completedAt
    }).then((data) =>{
    console.log('the post saved is',data);
    console.log('the title is', data.title);

    res.send({
      error : false,
      code : 200,
      id: data._id,
      title : data.title,
      tags: data.tags,
      author : data.author,
      imageUrl : data.imageUrl,
      body : data.body,
      likes : data.likes,
      dislikes : data.dislikes,
      completedAt : data.completedAt
    })
    
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
  app.patch('/posts/:id', (req, res) =>{
    const id = req.params.id;
    console.log('the id is', id);
    const body = _.pick(req.body, ['title','story', 'author']);

    if(!ObjectID.isValid(id)){
     return res.status(404).send();
    }

    PostModel.findByIdAndUpdate(id, {$set: body}, {new: true}).then((data) =>{
      if(!data){
        return res.status(404).send();
      }
      console.log("heyy")
      res.send({
        error : false,
        code : 200,
        id: data._id,
        title : data.title,
        tags: data.tags,
        author : data.author,
        imageUrl : data.imageUrl,
        body : data.body,
        likes : data.likes,
        dislikes : data.dislikes,
        completedAt : data.completedAt
      });

    }).catch((e) =>{
      console.log('error', e)
      return res.status(400).send();

    });

  });

  //route to increment likes
  app.patch('/posts/likes/:id', (req, res) =>{
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }else{
      PostModel.findById(id, (err, post) =>{
      console.log ('the post we want to update', post)
      const likesValue = post.likes;
      const newLikesValue = likesValue + 1;

      PostModel.findByIdAndUpdate(id, {likes : newLikesValue}, {new : true}).then((blog) =>{
        if(!blog){
          return res.status(404).send({});
        }
        res.send(blog);
      }).catch((e) =>{
        return res.status(400).send(e);
      })
    
    
    });
        }
  });

  //route to increment dislikes
  app.patch('/posts/dislikes/:id', (req, res) =>{
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }else{
      PostModel.findById(id, (err, post) =>{
      console.log ('the post we want to update', post)
      const dislikesValue = post.dislikes;
      const newDislikesValue = dislikesValue + 1;

      PostModel.findByIdAndUpdate(id, {dislikes : newDislikesValue}, {new : true}).then((blog) =>{
        if(!blog){
          return res.status(404).send();
        }
        res.send(blog);
      }).catch((e) =>{
        return res.status(400).send(e);
      })
    
    
    });
        }
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
  PostModel.findById(id).then((data) =>{
    if(!data){
      console.log('the result is not ',data);
     res.status(400).send();

    }else{
      console.log('the result is',data);
      res.send({ error : false,
        code : 200,
        id: data._id,
        title : data.title,
        tags: data.tags,
        author : data.author,
        imageUrl : data.imageUrl,
        body : data.body,
        likes : data.likes,
        dislikes : data.dislikes,
        completedAt : data.completedAt});
      
    }
  }).catch((err) =>{
    console.log('error getting the blog post by id', err);
    const errorMessage = new Response(400, 'error finding blog post', res, true, err);

  });

  });

  //route to get post based on tags
  app.get('/posts/tags/:tag', (req, res) => {
    let tag = req.params.tag;
    console.log('the tag is:', tag);

    
  PostModel.find({tags : {$regex : tag, $options : 'i' }} ).then((data) =>{
      if(!data){
        res.status(404).send();
      }else{
        console.log('response based by tag :', data);
        res.send(data);
      }
    }).catch((e) =>{
      res.status(404).send(e);
    })
  })

  //route to delete post
  app.delete('/posts/:id', (req, res) =>{
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

  //route to logout
  app.delete('/user/logout', authenticate, (req, res) =>{
    removeToken(req.token).then(() =>{
        res.status(200).send();
    }, () =>{
      res.status(400).send();
    })
  });

  //route to export to database 
app.get('/post/export', (req, res) =>{
  PostModel.find().then((posts) =>{
    if(!posts){
     return res.status(404).send();
    }else{
      let csv
      try{
        csv = json2csv(posts, {fields})
        console.log('csv : ', csv);
      }catch (err) {
        console.log('error is :',  err)
             return res.status(500).send({err});
      }
      const dateTime = moment().format('YYYYMMDDhhmmss');
      const filePath = path.join(__dirname,  "..", "public", "exports", "csv-" + dateTime + ".csv" );
      console.log('the file path is : ', filePath);
            fs.writeFile(filePath, csv,  (err) => {
        if(err){
          console.log(err)
          return res.status(500).json(err);
        }else{
          console.log('stamema samena')
          res.download(filePath, csv)
        }
})

}
  }).catch((e) =>{
    console.log('error here', e)
    res.status(404).send(e);
  })
})



  







app.on('listening', ()=>{
  console.log('server started on port' );
});

app.listen(3006)

module.exports = app