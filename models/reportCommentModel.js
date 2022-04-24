const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reportCommentSchema = new Schema({
    postId:{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required:true
    },
    commentId:{
        type: Schema.Types.ObjectId,
        required:true
    },
    resolved:{
        type:Boolean,
        default:false
    },
    comment:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const ReportComment = mongoose.model('ReportComment', reportCommentSchema)

module.exports = ReportComment