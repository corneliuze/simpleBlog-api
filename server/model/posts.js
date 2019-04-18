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
        type : Date,
        default : new Date('YYYY-MM-DDTHH:mm:ss.sssZ')
    },

    likes:{
        type : Number

    },
    dislikes:{
        type : Number
}

});


function findByTag(tag, callback){
    return this.find({tag}, callback)

}

const PostModel = mongoose.model('Posts', PostSchema);
module.exports = {PostModel, findByTag}