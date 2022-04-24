const express = require('express')
const { isAuth, getUserSpecificData, updatePagePostShowTo } = require('../utils.js')
// const Post = require('../models/postModel')
const User = require('../models/userModel')
const Page = require('../models/pageModel')
const Post = require('../models/postModel')

const pageRouter = express.Router()

pageRouter.get('/create',isAuth, async(req,res)=>{
    const pages = await Page.find({userId:req.user._id,published:false})
    if(pages.length != 0){
        res.send(pages[0])
    }else{
        const user = await User.findById(req.user._id)
        var page = new Page({
            user:{
                name:user.name,
                avatar:user.avatar,
                userType:user.userType
            },
            userId:req.user._id,
            followers:[]
        })

        const savedPage = await page.save()
        res.send(savedPage)
    }
})

pageRouter.post('/update/:p_id',isAuth, async(req,res)=>{
    
    const page_id = req.params['p_id']
    const page = await Page.findById(page_id)
    if(page.userId == req.user._id){
        const data = req.body
        page.subject = data.subject
        page.description = data.description
        page.medium = data.medium
        page.grade = data.grade
        page.name = `Grade : ${data.grade}, ${data.subject} (${data.medium})`
        if(page.subject || page.medium || page.grade) {
            page.published = true
        }else{
            await Page.deleteMany({_id:{$ne:page_id},userId:req.user._id,published:false})
            page.published = false
        }
        await page.save()
        
    }
    res.send({"page":page})
})

pageRouter.get('/my-pages',isAuth, async (req,res)=>{
    const pages = await Page.find({userId:req.user._id,published:true})
    res.send(pages)
})

pageRouter.get('/:p_id', async(req,res)=>{
    const page_id = req.params['p_id']
    const page = await Page.findById(page_id)
    res.send(page)
})

pageRouter.get('/:p_id/post', async(req,res)=>{
    const page_id = req.params['p_id']
    const posts = await Post.find({pageId:page_id,posted:true})
    res.send(posts)
})

pageRouter.get('/:p_id/post/create',isAuth, async(req,res)=>{
    const page_id = req.params['p_id']
    const posts = await Post.find({pageId:page_id,posted:false})
    if(posts.length != 0){
         res.send(posts[0])
    }else{
        const user = await User.findById(req.user._id)
        const page = await Page.findById(page_id)
        var post = new Post({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            page:{
                name:page.name,
                avatar:page.avatar
            },
            pagePost:true,
            userId:req.user._id,
            showTo:user.friends,
            pageId:page_id,
            medium:page.medium,
            grade:page.grade,
            subject:page.subject,
            followers:[]
        })
        const savedPost = await post.save()
        res.send(savedPost) 
    }
})


pageRouter.get('/:p_id/followers', async(req,res)=>{
    const page_id = req.params['p_id']
    const page = await Page.findById(page_id)
    const followers = await User.find({'_id':{
        $in: page.followers
    }}).select('_id name avatar userType').sort('name')
    res.send(followers)
})

pageRouter.get('/:p_id/follow',isAuth, async(req,res)=>{
    const page_id = req.params['p_id']
    var page = await Page.findById(page_id)
    var idx = page.followers.findIndex((u_id)=>{
        if(u_id == req.user._id) return true
        return false
    })

    if(idx == -1){
        page.followers.push(req.user._id)
    }

    await page.save()
    updatePagePostShowTo(page_id)
    res.send(page)
})

pageRouter.get('/:p_id/unfollow',isAuth, async(req,res)=>{
    const page_id = req.params['p_id']
    var page = await Page.findById(page_id)
    var idx = page.followers.findIndex((u_id)=>{
        if(u_id == req.user._id) return true
        return false
    })

    if(idx > -1){
        page.followers.splice(idx,1)
    }

    await page.save()
    updatePagePostShowTo(page_id)
    res.send(page)
})

// pageRouter.post('rate/p_id', async(req,res)=>{
//     const data = req.body
//     const page_id = req.params['p_id']
//     var page = await Post.findById(page_id)
//     if(page.rate){
//         page.rate = (page.rate+data.rate)/2
//     }else{
//         page.rate = data.rate
//     }
//     await page.save()
//     res.send(page)
// })

module.exports = pageRouter