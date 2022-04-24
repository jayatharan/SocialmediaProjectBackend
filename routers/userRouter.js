const express = require('express')
const { OAuth2Client } =require('google-auth-library')
const User = require('../models/userModel')
const Page = require('../models/pageModel')
const Post = require('../models/postModel')
const Notification = require('../models/notificationModel')
const { generateToken, isAuth, getUserSpecificData, getMyRequestedIds, removeFriendOfUser, updatePostShowto, newSchoolNotification } = require('../utils.js')

const userRouter = express.Router()

const client = new OAuth2Client("686177336588-qhhagupocke5qsclkt0n07h9s6c8bbpu.apps.googleusercontent.com")

userRouter.get('/get_users',async(req,res)=>{
    const params = req.query
    var filter = {userType:"Student"}
    if(params.grade) filter["grade"] = params.grade
    if(params.medium) filter["medium"] = params.medium
    if(params.district) filter["district"] = params.district
    if(params.userType) filter["userType"] = params.userType
    const users = await User.find(filter).select("_id")
    var u_ids = users.map((u)=> {return(u._id)})
    res.send(u_ids)
})

userRouter.get('/filter_users', async(req,res)=>{
    const params = req.query
    var filter = {}
    if(params.grade) filter["grade"] = params.grade
    if(params.medium) filter["medium"] = params.medium
    if(params.district) filter["district"] = params.district
    if(params.userType) filter["userType"] = params.userType
    if(params.grade) filter["grade"] = params.grade
    if(params.school) filter["school"] = params.school
    if(params.class) filter["class"] = params.class
    const users = await User.find(filter)
    res.send(users)
})

userRouter.get('/my_data',isAuth,async(req,res)=>{
    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)
    const user = await User.findById(req.user._id)
    
    res.send({"user":user, "token":token})
})

userRouter.post('/login',(req,res)=>{
    const {tokenId} = req.body
    client.verifyIdToken({idToken:tokenId,audience:"686177336588-qhhagupocke5qsclkt0n07h9s6c8bbpu.apps.googleusercontent.com"})
    .then(response => {
        User.findOne({email:response.payload.email})
        .then((o_user) => {
            if(!o_user){
                const user = new User({
                    name:response.payload.name,
                    email:response.payload.email,
                    avatar:response.payload.picture
                })
                user.save()
                .then((result)=>{
                    res.send({"user":result,"token":generateToken(result)})
                })
                .catch((err)=>{
                    res.send(err)
                })
            }else{
                if(response.payload.picture == o_user.avatar){
                    res.send({"user":o_user, "token":generateToken(o_user)})
                }else{
                    o_user.avatar = response.payload.picture
                    o_user.save()
                    res.send({"user":o_user, "token":generateToken(o_user)})
                }
            }
        })
        .catch((err)=>{
                res.send(err)
        })
    })
    .catch((err)=>{
                res.send(err)
        })
})

userRouter.post('/update',isAuth,async (req,res)=>{
    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)
    const user = await User.findById(req.user._id)
    const data = req.body
    
    if(data.userType == "Student"){
    user.medium = data.medium
    user.grade = data.grade
    user.district = data.district
    user.updated = true
    user.userType = "Student"
    user.school = data.school?data.school:null
    user.class = data.class
    }

    if(data.userType == "Teacher"){
        user.medium = ""
        user.grade = ""
        user.district = data.district
        user.phoneNo = data.phoneNo
        user.updated = true
        user.school = data.school?data.school:null
        user.userType = "Teacher"
    }

    if(data.userType == "School"){
        user.medium = ""
        user.grade = ""
        user.district = data.district
        user.phoneNo = data.phoneNo
        user.updated = true
        user.userType = "School"
        user.name = data.name
    }
    await user.save()

    res.send({"user":user, "token":token})
})

userRouter.get('/my_friends',isAuth,async(req,res)=>{
    
    const user = await User.findById(req.user._id)
    const friends = await User.find({'_id':{
        $in: user.friends
    }}).select('_id name avatar userType').sort('name')
    
    res.send(friends)
})

userRouter.get('/my_notifications',isAuth,async(req,res)=>{
    const notifications = await Notification.find({to:req.user._id})
    res.send(notifications)
})

userRouter.post('/school_send_notification',isAuth,async(req,res)=>{
    const data = req.body
    await newSchoolNotification(req.user._id,data)
    res.send("Notification Send Successfully")
})

userRouter.get('/following-pages',isAuth,async(req,res)=>{
    const pages = await Page.find({followers:{"$in":[req.user._id]}})
    res.send(pages)
})

userRouter.get('/user_data/:u_id', async(req,res)=>{
    const u_id = req.params['u_id']
    const posts = await Post.find({userId:u_id})
    const pages = await Page.find({userId:u_id})
    res.send({posts,pages})
})

userRouter.get('/un_friend/:f_id',isAuth,async (req,res)=>{
    const u_id = req.user._id
    const f_id = req.params['f_id']
    await removeFriendOfUser(u_id,f_id)

    //no need to wait untill bellow process finish (Background Process)
    removeFriendOfUser(f_id,u_id)
    updatePostShowto(u_id,f_id)
    updatePostShowto(f_id,u_id)
    //finish

    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)

    const user = await User.findById(u_id)

    res.send({"user":user, "token":token})
})

userRouter.get('/search/:keyword',async(req,res)=>{
    const keyword = req.params['keyword']
    const datas = await getUserSpecificData(req)
    var people = null
    var pages = null
    var requestedIds =[]
    if(datas.user){
        var friends = datas.user.friends
        requestedIds = await getMyRequestedIds(datas.user._id)
        if(keyword === "none"){
            people = await User.find({updated:true,_id:{$nin:[...friends,...requestedIds]}}).sort('-updatedAt').limit(50).select('_id name avatar userType')
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }else{
            people = await User.find({ name: { $regex: keyword, $options: "i" }}).select('_id name avatar userType')
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }
        if(datas.user.userType == "Student"){
            pages = await Page.find({ grade:datas.user.grade,medium:datas.user.medium,published:true,followers:{$nin:[datas.user._id]} }).sort('-updatedAt').limit(50)
        }else{
            pages = await Page.find({ published:true,userId:{$ne:datas.user._id} }).sort('-updatedAt').limit(50)
        }
    }else{
        if(keyword === "none"){
            people = await User.find({updated:true}).select('_id name avatar userType').limit(50)
        }else{
            people = await User.find({ name: { $regex: keyword, $options: "i" }}).select('_id name avatar userType')
        }
        pages = await Page.find({ published:true }).sort('-updatedAt').limit(50)
    }
    res.send({people,requestedIds,pages})
})

userRouter.get('/deleteNotification/:n_id', async(req,res)=>{
    try{
        await Notification.deleteOne({_id:req.params.n_id})
        res.send()
    }catch (err){
        res.status(400).send({})
    }
})

module.exports = userRouter
