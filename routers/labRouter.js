const express = require('express')
const { isAuth, getUserSpecificData, newPostNotification } = require('../utils.js')

const Lab = require('../models/LabModel')
const LabItem = require('../models/LabItemModel')
const User = require('../models/userModel')

const labRouter = express.Router()

labRouter.get('/', isAuth, async(req,res)=>{
    const labs = await Lab.find({schoolId:req.user._id, published:true})
    res.send(labs)
})

labRouter.post('/', isAuth, async(req,res)=>{
    try{
        const data = req.body
        const school = await User.findById(req.user._id)
        var lab = new Lab({
            name:data.name,
            schoolId:req.user._id,
            school:school.name
        })
        await lab.save()
        res.send({success:true})
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.get('/create', isAuth, async(req,res)=>{
    const labs = await Lab.find({schoolId:req.user._id, published:false})
    if(labs.length != 0){
        res.send(labs[0])
    }else{
        const school = await User.findById(req.user._id)
        var lab = new Lab({
            schoolId:req.user._id,
            schoolName:school.name
        })
        await lab.save()
        res.send(lab)
    }
})

labRouter.get('/search', async(req,res)=>{
    const params = req.query
    const search = params.search
    const labItems = await LabItem.find({name:{$regex:search,$options:"si"}})
    res.send(labItems)
})

labRouter.get('/:id', async(req,res)=>{
    const lab = await Lab.findById(req.params.id)
    res.send(lab)
})

labRouter.get('/:id/view', async(req,res)=>{
    const lab = await Lab.findById(req.params.id)
    const labItems = await LabItem.find({labId:req.params.id, published:true})
    res.send({lab,labItems})
})

labRouter.delete('/:id', async(req,res)=>{
    try{
        await LabItem.deleteMany({labId:req.params.id})
        var lab = await Lab.findById(req.params.id)
        await lab.delete()
        res.send({success:true})
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.put('/:id', async(req,res)=>{
    try{
        var lab = await Lab.findById(req.params.id)
        var data = req.body
        if(data.name){
            lab.name = data.name
        }
        await lab.save()
        res.send({success:true})
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.get('/:id/lab-item/create', async(req,res)=>{
    try{
        const labItems = await LabItem.find({labId:req.params.id, published:false})
        if(labItems.length != 0){
            res.send(labItems[0])
        }else{
            var lab = await Lab.findById(req.params.id)
            var labItem = new LabItem({
                labId:req.params.id,
                schoolName:lab.schoolName
            })
            await labItem.save()
            res.send(labItem)
        }
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.post('/update/:l_id', isAuth, async(req,res)=>{
    const l_id = req.params.l_id
    const lab = await Lab.findById(l_id)
    const data = req.body
    console.log(data)
    if(data.name){
        lab.name = data.name
        lab.published = true
        await lab.save()
    }
    res.send(lab)
})

labRouter.get('/school/:id', async (req,res)=>{
    const labs = await Lab.find({schoolId:req.params.id})
    res.send(labs)
})

labRouter.get('/:id/lab-item', async(req,res)=>{
    const labItems  = await LabItem.find({labId:req.params.id})
    res.send(labItems)
})

labRouter.post('/lab-item/:id', async(req,res)=>{
    try{
        var data = req.body
        var labItem = await LabItem.findById(req.params.id)
        if(data.name) labItem.name = data.name
        if(data.img_name) labItem.img_name = data.img_name
        if(data.quantity) labItem.quantity = data.quantity
        if(data.unit) labItem.unit = data.unit
        if(data.name && data.unit){
            labItem.published = true
        }
        await labItem.save()
        res.send(labItem)
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.get('/lab-item/:id', async(req,res)=>{
    try{
        var labItem = await LabItem.findById(req.params.id)
        res.send(labItem)
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

labRouter.delete('/lab-item/:id', async(req,res)=>{
    try{
        var labItem = await LabItem.findById(req.params.id)
        await labItem.delete()
        res.send({success:true})
    }catch{
        (err)=>{
            res.status(400).send("error")
        }
    }
})

module.exports = labRouter