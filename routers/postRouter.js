const express = require('express')
const { isAuth, getUserSpecificData, newPostNotification } = require('../utils.js')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Report = require('../models/reportModel')
const ReportComment = require('../models/reportCommentModel')

const postRouter = express.Router()

// postRouter.get('/my_posts',isAuth,async (req,res)=>{
//     const posts = await Post.find({userId:req.user._id,posted:true})
//     res.send({"Test":posts})
// })


postRouter.get('/my_posts',isAuth, async(req,res)=>{
    const posts = await Post.find({userId:req.user._id,posted:true})
    res.send(posts)
})

postRouter.get('/',async(req,res)=>{
    const datas = await getUserSpecificData(req)
    var posts = null
    if(datas.user){
        posts = await Post.find({$or:[{posted:true,showTo:{"$in":[datas.user._id]}},{posted:true,userId:datas.user._id}]}).sort('-updatedAt').select('_id user page pagePost title description youtubeId files likes createdAt commentCount userId type medium subject grade answers')
    }else{
        posts = await Post.find({posted:true}).select('_id user page pagePost title description youtubeId files likes createdAt commentCount userId type medium subject grade answers')
    }
    res.send(posts)
})

postRouter.get('/create',isAuth, async(req,res)=>{
    const params = req.query
    var posts = null
    if(params.type && params.type == "question"){
        posts = await Post.find({userId:req.user._id,posted:false,type:"question"})
    }else{
        posts = await Post.find({userId:req.user._id,posted:false,type:"post"})
    }
    if(posts.length != 0){
         res.send(posts[0])
    }else{
        const user = await User.findById(req.user._id)
        var post = new Post({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            userId:req.user._id,
            showTo:user.friends
        })
        if(params.type && params.type == "question"){
            post.type = "question"
        }

        if(user.userType == 'Student'){
            post.medium = user.medium
            post.grade = user.grade
        }
        const savedPost = await post.save()
        res.send(savedPost) 
    }
})

postRouter.get('/reported_post' , async(req,res)=>{
    try{
        const reports = await Report.find({
            resolved:false
        })
        const p_ids = []
        const u_ids = [] 
        reports.map((r)=>{
            p_ids.push(r.postId)
            u_ids.push(r.userId)
        })
        const posts = await Post.find({
            _id:{$in:p_ids}
        })
        const users = await User.find({
            _id:{$in:u_ids}
        })
        res.send({posts,users})
    }catch (err){
        res.status(400).send(err)
    }
})

postRouter.get('/reported_comment' , async(req,res)=>{
    try{
        const reports = await ReportComment.find({
            resolved:false
        })
        res.send(reports)
    }catch (err){
        res.status(400).send(err)
    }
})

postRouter.get('/:p_id',async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    res.send(post)
})

postRouter.delete('/:p_id',async(req,res)=>{
    try{
        const post_id = req.params['p_id']
        await Post.deleteOne({_id:post_id})
        res.send({success:true})
    }catch (err){
        res.status(400).send(err)
    }
})

postRouter.get('/like/:p_id',isAuth,async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    var index = post.likes.indexOf(req.user._id);
    if (index > -1) {
        post.likes.splice(index, 1);
    }
    else post.likes.push(req.user._id)
    await post.save()
    res.send(post)
})

postRouter.post('/update/:p_id',isAuth, async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    if(post.userId == req.user._id){
        const data = req.body
        if(post.type == "question"){
            post.subject = data.title
        }
        post.title = data.title
        post.description = data.description
        post.youtubeId = data.youtubeId
        post.files = data.files
        post.medium = data.medium
        post.grade = data.grade
        if(post.title && (post.youtubeId || post.description || post.files.length)) {
            post.posted = true
        }else{
            await Post.deleteMany({_id:{$ne:post_id},userId:req.user._id,posted:false})
            post.posted = false
        }
        await post.save()
        newPostNotification(post_id)
    }
    res.send({"post":post})
})

postRouter.get('/comments/:p_id',async(req,res)=>{
    const p_id = req.params['p_id']
    var post = await Post.findById(p_id)
    if(!post.comments){
        post.comments = []
    }
    res.send(post.comments)
})

postRouter.post('/add_comment/:p_id',isAuth,async(req,res) => {
    const p_id = req.params['p_id']
    var post = await Post.findById(p_id)
    const user = await User.findById(req.user._id)
    const data = req.body
    var comment = {
        userId:user.userId,
        name:user.name,
        avatar:user.avatar,
        content:data.content
    }
    if(!post.comments){
        post.comments = []
    }
    post.comments=[...post.comments,comment]
    post.commentCount = post.comments.length
    await post.save()
    
    res.send(post.comments)
})

postRouter.get('/delete_comment/:p_id/:c_id',isAuth,async(req,res)=>{
    const p_id = req.params['p_id']
    const c_id = req.params['c_id']
    var post = await Post.findById(p_id)
    const index = post.comments.findIndex(comment=>comment._id.toString() === c_id)
    if (index>-1){
        post.comments.splice(index,1)
    }
    post.commentCount = post.comments.length
    await post.save()
    res.send(post.comments)
})

postRouter.post('/promote/:p_id', async(req,res)=>{
    const data = req.body
    const p_id = req.params['p_id']
    var post = await Post.findById(p_id)
    const showTo = [...data.userIds,...post.showTo]
    post.showTo = showTo
    await post.save()
    res.send({post})
})

postRouter.post('/report/:p_id', async(req,res)=>{
    const data = req.body
    const p_id = req.params['p_id']
    const post = await Post.findById(p_id)
    var report = new Report({
        postId:p_id,
        userId:post.userId,
        report:"Post Report",
        reason:data.reason
    })
    report.save()
    .then((r)=>{
        res.send(r)
    }).catch((err)=>{
        console.log(err)
        res.status(400).send(err)
    })
})

postRouter.post('/report/:p_id/resolve', async(req,res)=>{
    try{
        const data = req.body
        const p_id = req.params['p_id']
        await Report.updateMany({postId:p_id},{$set:{"resolved":true}})
        if(data.delete){
            await Post.deleteOne({_id:p_id})
        }
        res.send({success:true})
    }catch (err){
        console.log(err)
        res.status(400).send(err)
    }
})

postRouter.post('/report_comment', async(req,res)=>{
    try{
        const data = req.body
        const p_id = data.p_id
        const c_id = data.c_id
        const post = await Post.findById(p_id)
        const comment = post.comments.find((c)=>c._id == c_id)
        var report = new ReportComment({
           postId:p_id,
           commentId:c_id
        })
        if(comment){
            report.comment = comment.content
        }
        report.save()
        .then((r)=>{
            res.send(r)
        }).catch((err)=>{
            console.log(err)
            res.status(400).send(err)
        })
    }catch (err){
        console.log(err)
        res.status(400).send(err)
    }
})

postRouter.post('/report_comment/:r_id/resolve', async(req,res)=>{
    try{
        const data = req.body
        const r_id = req.params['r_id']
        const report = await ReportComment.findById(r_id);
        report.resolved = true
        let p_id = report.postId
        let c_id = report.commentId
        var post = null
        if(data.delete){
            post = await Post.findById(p_id)
            const commentIds = post.comments.map((c)=>c._id.toString())
            var index = commentIds.findIndex((id) => {
                if(id === c_id.toString()) return true;
                else return false;
            })
            if (index>-1){
                post.comments.splice(index,1)
            }
            post.commentCount = post.comments.length
            await post.save()
        }
        await report.save()
        res.send({success:true, report})
    }catch (err){
        console.log(err)
        res.status(400).send(err)
    }
})

postRouter.post('/:q_id/add-answer',async(req,res)=>{
    const q_id = req.params['q_id']
    const data = req.body
    var question = await Post.findById(q_id)
    question.answers.push(data)
    await question.save()
    res.send(question)
})

module.exports = postRouter