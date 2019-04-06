const express = require('express');
const BodyParser = require('body-parser');
const PostModel = require('./model/posts');
const UserModel = require('./model/users');
const {ObjectID} = require('mongodb');

const app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended : false}));


//home route
app.get('/', (req, res) =>{
    res.send('welcome to the Blog app by Falaye Iyanuoluwa');
})