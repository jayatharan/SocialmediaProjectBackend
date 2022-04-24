const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reportSchema = new Schema({
    postId:{
        type: Schema.Types.ObjectId, 
        ref: 'Post'
    },
    userId:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    reason:{
        type:String,
        default:""
    },
    report:{
        type:String,
        default:""
    },
    resolved:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const Report = mongoose.model('Report', reportSchema)

module.exports = Report