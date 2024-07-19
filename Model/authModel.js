const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
    
},
{
    timeStamp:true,
    versionKey:false
})

const authModel =  new mongoose.model("authModel",authSchema);
module.exports = authModel;