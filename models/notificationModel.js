const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificationSchema = new Schema({
    name:String,
    avatar:String,
    title:String,
    content:String,
    to:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    toAdmin:{
        type:Boolean,
        default:false
    },
    fromAdmin:{
        type:Boolean,
        default:false
    },
    school:{
        type:Boolean,
        default:false
    }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification