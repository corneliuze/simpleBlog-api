const mongoose = require('../db/mongoose');


var  PostSchema = mongoose.Schema({
    title :{
        type : String,
        minLength : 10,
        required: true

    },
     imageUrl: {

    },
    body :{
        type : String,
        minLength : 3,
        required : true

    }

});


module.exports = PostModel