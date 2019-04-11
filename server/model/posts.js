const mongoose = require('../db/mongoose');






var  PostSchema = mongoose.Schema({
    tag :[{
        type : String,
     }],
    title :{
        type : String,
        minLength : 10,
        required: true

    },
     imageUrl: {
         type :  String,
         required : true

    },
    story :{
        type : String,
        minLength : 3,
        required : true
    },
    completedAt :{
        type : Number
        
    },
    likes:{
        type : Number

    },
    dislikes:{
        type : Number

    }

});

const PostModel = mongoose.model('Posts', PostSchema);
module.exports = PostModel