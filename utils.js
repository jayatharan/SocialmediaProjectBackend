const User = require('./models/userModel')
const Post = require('./models/postModel')
const Page = require('./models/pageModel')

const FriendRequest = require('./models/friendRequestModel')
const Notification = require('./models/notificationModel')

const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    const token = jwt.sign(
        {
            _id:user._id,
        },
        'jwtsecret',
        {
            expiresIn: '30d',
        }
    )
    return token;
}

const isAuth = (req,res,next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      'jwtsecret',
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: 'No Token' });
  }
}

const updatePostShowto = async(userId)=>{
  const user = await User.findById(userId)
  await Post.updateMany({userId:userId},{'$set':{
    showTo:user.friends
  }})
}

const updatePagePostShowTo = async(pageId)=>{
  const page = await Page.findById(pageId)
  await Post.updateMany({pageId:pageId},{
    '$set':{
      showTo:page.followers
    }
  })
}

const updateFriendOfUser = async(userId,friendId)=>{
  const user = await User.findById(userId)
  user.friends.push(friendId)
  await user.save()
}

const removeFriendOfUser = async(userId,friendId)=>{
  var user = await User.findById(userId)
  var friends = user.friends
  const index = friends.findIndex(id => id.toString() === friendId)
  if(index > -1){
    friends.splice(index,1)
    user.friends = friends
    await user.save()
  }
}

const getUserSpecificData = async(req)=>{
  var userType = "All"
  var medium = "All"
  var grade = "All"
  var user = null

  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    await jwt.verify(
      token,
      'jwtsecret',
      async(err, decode) => {
        if (err) {
          user = null
        } else {
          user = await User.findById(decode)
          userType = user.userType
          medium = user.medium
          grade = user.grade
        }
      }
    );
  }
  return {userType,medium,grade,user}
}

const getMyRequestedIds = async(userId)=>{
  requests = await FriendRequest.find({fromUserId:userId}).select('toUserId')
  toIds = []
  requests.map((request)=> toIds.push(request.toUserId) )
  return toIds
}

const newNotification = async(data)=>{
  try{
    const notification = new Notification(data)
    await notification.save()
  }catch (err) {
    throw err
  }
}

const newSchoolNotification = async(userId,data)=>{
  const user = await User.findById(userId)
  //const friends = user.friends
  var friends = []
  await User.find({"school":userId})
  .then((db)=>{
    db.map((u)=>friends.push(u._id))
  })
  var sendTo = []
  if(data.userType == "Teacher"){
    users = await User.find({_id:{"$in":friends},userType:"Teacher"})
    users.map((u)=>sendTo.push(u._id))
  }else{
    filter = {}
    if (data.medium) filter["medium"] = data.medium
    if (data.grade) filter["grade"] = data.grade
    if (data.userType) filter["userType"] = data.userType
    if (data.class) filter["class"] = data.class
    users = await User.find({_id:{"$in":friends},...filter})
    users.map((u)=>sendTo.push(u._id))
  }
  sendTo.map((userId)=>{
    data.to = userId
    data.school = true
    data.name = user.name
    data.avatar = user.avatar
    newNotification(data)
  })
}

const newPostNotification = async(postId)=>{
  try{
    const post = await Post.findById(postId)
    var data = {
      avatar:post.user.avatar
    }
    if(post.pagePost) {
      data.name = post.page.name
    }
    else data.name = post.user.name

    if(post.type == "post") {
      data.content = post.title
      data.title = "Added a New Post"
    }else{
      data.title = "Asked a New Question"
    }
    post.showTo.map((userId)=>{
      data.to = userId
      newNotification(data)
    })
  }catch (err) {
    throw err
  }
}

module.exports = { generateToken, isAuth, updatePostShowto, updateFriendOfUser, getUserSpecificData, getMyRequestedIds, removeFriendOfUser, updatePagePostShowTo, newNotification, newPostNotification, newSchoolNotification }