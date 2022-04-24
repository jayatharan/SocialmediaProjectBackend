const express = require('express')
const { isAuth, updatePostShowto, updateFriendOfUser } = require('../utils.js')
const FriendRequest = require('../models/friendRequestModel')
const User = require('../models/userModel')

const requestRouter = express.Router()

requestRouter.get('/send/:u_id',isAuth,async(req,res)=>{
    var u_id = req.params['u_id']
    var tUser = await User.findById(u_id)
    var frmUser = await User.findById(req.user._id)

    const requests = await FriendRequest.find({
        fromUserId:frmUser._id,
        toUserId:tUser._id,
    })
    var request = null
    if(requests.length == 0){
            request = new FriendRequest({
            fromUserId:frmUser._id,
            fromUser:{
                name:frmUser.name,
                avatar:frmUser.avatar,
                userType:frmUser.userType
            },
            toUserId:tUser._id,
            toUser:{
                name:tUser.name,
                avatar:tUser.avatar,
                userType:tUser.userType
            }
        })
    }
    else{
        request = requests[0]
    }

    await request.save()

    res.send(request)
})

requestRouter.get('/cancel/:u_id',isAuth,async(req,res)=>{
    const u_id = req.params['u_id']
    const request = await FriendRequest.findOne({fromUserId:req.user._id,toUserId:u_id})
    if(request){
        if(request.fromUserId == req.user._id){
            await FriendRequest.findByIdAndDelete(request._id)
            res.send(request._id)
        }
        res.send()
    }
    res.send()
})

requestRouter.get('/my_requests',isAuth,async(req,res)=>{
    const u_id = req.user._id
    requests = await FriendRequest.find({
        toUserId:u_id
    })
    res.send(requests)
})



requestRouter.get('/:action/:r_id',isAuth,async(req,res)=>{
    const action = req.params['action']
    const r_id = req.params['r_id']
    const u_id = req.user._id
    const request = await FriendRequest.findById(r_id)

    if(!request){
        res.status(401).send({ message: 'Request not found' })
    }

    else if(request.toUserId == u_id){
        const authorization = req.headers.authorization;
        const token = authorization.slice(7, authorization.length)

        if(action == 'accept'){
            
            await updateFriendOfUser(request.toUserId,request.fromUserId)
            await updateFriendOfUser(request.fromUserId,request.toUserId)
            
            //no need to wait untill bellow process finish (Background Process)
            updatePostShowto(request.fromUserId)
            updatePostShowto(request.toUserId)
            FriendRequest.findOneAndDelete({toUserId:request.fromUserId,fromUserId:request.toUserId})
            //Finish
            
            await FriendRequest.findByIdAndDelete(r_id)
            const tUser = await User.findById(request.toUserId)
            
            res.send({"user":tUser, "token":token})
        }
        else if(action == 'reject'){
            await FriendRequest.findByIdAndDelete(r_id)
            res.send({"status":"success"})
        }    
    }
    
    else{
        res.status(401).send({ message: 'Invalid Token' })
    }
})

module.exports = requestRouter