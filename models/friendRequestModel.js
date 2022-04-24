const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:String,
    avatar:String,
    userType:String
})

const requestShema = new Schema({
    fromUserId:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    fromUser:userSchema,
    toUserId:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    toUser:userSchema,
    viewed:{
        type:Boolean,
        default:false
    }
    },
    {
        timestamps:true
    }
)

const FriendRequest = mongoose.model('FriendRequest',requestShema)

module.exports = FriendRequest