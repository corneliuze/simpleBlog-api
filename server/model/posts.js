const mongoose = require('../db/mongoose');






const  PostSchema = mongoose.Schema({
    tags :[{
        type : String,
     }],
    title :{
        type : String,
        minLength : 10,
        required: true

    },
     imageUrl: {
         type :  String,
    },
    story :{
        type : String,
        minLength : 3,
        required : true
    },
    author:{
        type : String,
    },
    completedAt :{
        type : Number,
        default : null
    },

    likes:{
        type : Number

    },
    dislikes:{
        type : Number
}

});




PostSchema.static('findByTag', (tag, callback) =>{
    return this.find({tag}, callback)

})

const PostModel = mongoose.model('Posts', PostSchema);
module.exports = PostModel