const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    name:String,
    avatar:String,
    userType:String
})

const pageSchema = new Schema({
    name:String,
    user:userSchema,
    avatar:String,
    description:String,
    grade:String,
    medium:String,
    subject:String,
    rate:Number,
    userId:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    published:{
        type:Boolean,
        default:false
    },
    followers:[{
        type: Schema.Types.ObjectId, 
        ref: 'User',
    }],
    followers:[{
        type:Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Page = mongoose.model('Page',pageSchema)

module.exports = Page