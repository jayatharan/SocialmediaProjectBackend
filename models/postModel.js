const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:String,
    avatar:String
})

const pageSchema = new Schema({
    name:String,
    avatar:String
})

const commentSchema = new Schema({
    userId:{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        },
    name:String,
    avatar:String,
    content:String
})

const fileSchema = new Schema({
    drive_id:String,
    icon_url:String,
    preview_url:String,
    view_url:String,
    name:String
})

const answerSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId, 
            ref: 'User'
    },
    user:userSchema,
    answer:String,
    youtubeId:{
            type:String
    },
    files:{
        type:[{
            type:fileSchema
        }],
        default:[]
    },
    description:{
            type:String,
    },
    postId:{
        type: Schema.Types.ObjectId, 
            ref: 'Post'
    },
    thumbsups:[
        {
        type: Schema.Types.ObjectId, 
            ref: 'User'
        }
    ]
})

const postSchema = new Schema(
    {
        user:userSchema,
        page:pageSchema,
        pagePost:{
            type:Boolean,
            default:false
        },
        title:{
            type:String,
        },
        description:{
            type:String,
        },
        userId:{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        },
        avl:{
            type:Boolean,
            default:false
        },
        posted:{
            type:Boolean,
            default:false
        },
        postType:{
            type:Number,
            default:0
        },
        youtubeId:{
            type:String
        },
        files:{
            type:[{
                type:fileSchema
            }],
            default:[]
        },
        answers:{
            type:[{
                type:answerSchema
            }],
            default:[]
        },
        type:{
            type:String,
            enum:["post","question"],
            default:"post"
        },
        report:[{
            com:{
                type:Schema.Types.ObjectId,
                ref: 'User'
            },
            content:String
        }],
        showTo:[{
            type:Schema.Types.ObjectId,
            ref: 'User'
        }],
        likes:[{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        }],
        comments:[commentSchema],
        commentCount:{
            type:Number,
            default:0
        },
        medium:String,
        grade:String,
        subject:String,
        pageId:{
            type: Schema.Types.ObjectId, 
            ref: 'Page'
        }
    },
    {
        timestamps:true
    }
)

const Post = mongoose.model('Post',postSchema)

module.exports = Post