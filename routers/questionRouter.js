const express = require('express')
const { isAuth, getUserSpecificData } = require('../utils.js')
const User = require('../models/userModel')
const Question = require('../models/questionModel')

const questionRouter = express.Router()

questionRouter.get('/', async(req,res)=>{
    const datas = await getUserSpecificData()
    const questions = await Question.find()
    res.send(questions)
})

questionRouter.get('/:q_id',async(req,res)=>{
    const q_id = req.params['q_id']
    const question = await Question.findById(q_id).select('user title question userId medium grade subject')
    res.send(question)
})

questionRouter.get('/create',isAuth,async(req,res)=>{
    const questions = await Question.find({userId:req.user._id,asked:false})
    if(questions.length != 0){
        res.send(questions[0])
    }else{
        const user = await User.findById(req.user._id)
        const question = new Question({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            userId:req.user._id,
            grade:user.grade,
            medium:user.medium
        })
        const savedQuestion = await question.save()
        res.send(savedQuestion)
    }
})

questionRouter.post('/update/:q_id',isAuth,async(req,res)=>{
    const q_id = req.params['q_id']
    var question = await Question.findById(q_id)
    const user = await User.findById(req.user._id)
    if(question){
        if(question.userId == req.user._id){
            const data = req.body
            question.question = data.question
            question.title = data.title
            question.medium = data.medium
            question.grade = data.grade
        }
        await question.save()
        res.send(question)
    }
    res.send({"status":"failed"})
})

questionRouter.post('/answer/:q_id',isAuth,async(req,res)=>{
    const q_id = req.params['q_id']
    const data = req.body
    const user = await User.findById(req.user._id)
    var question = await Question.findById(q_id)
    var answer = {
        userId:user._id,
        user:{
            name:user.name,
            avatar:user.avatar
        },
        answer:data.answer,
        youtubeId:data.youtubeId,
        files:[],
        description:data.description,
        postId:data.postId
    }
    question.answers.push(answer)
    question.save()
    res.send()
})

module.exports = questionRouter