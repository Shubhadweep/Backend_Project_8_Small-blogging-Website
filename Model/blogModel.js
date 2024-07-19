const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    userEmail:{
        type: String,
        required: true
    },
    image:{
        type: [String],
        required: true
    },
    
    
},
{
    timeStamp:true,
    versionKey:false
})

const blogModel =  new mongoose.model("blogModel",blogSchema);
module.exports = blogModel;