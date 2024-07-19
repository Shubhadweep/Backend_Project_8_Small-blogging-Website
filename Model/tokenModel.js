const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const TokenSchema = new Schema({
    _userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref:'authModel',
    },
    email:{
        type: String,
        required: true
    },
    token:{
        type:String,
        required: true
    }
});

const TokenModel = new mongooose.model("token_details",TokenSchema);
module.exports = TokenModel;