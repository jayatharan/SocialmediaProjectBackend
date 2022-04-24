const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const userRouter = require('./routers/userRouter')
const postRouter = require('./routers/postRouter')
const requestRouter = require('./routers/requestRouter')
const questionRouter = require('./routers/questionRouter')
const pageRouter = require('./routers/pageRouter')
const labRouter = require('./routers/labRouter')

const Choice = require('./models/choiceModel')

//port
const PORT = 5000

const dbURI = 'mongodb+srv://jayatharan:yhDCGk4I7TbMjs0E@cluster0.6qbug.mongodb.net/myFirstDatabase?retryWrites=true&w=majority' 

//const dbURI = 'mongodb://localhost:27017/socialApp'
const app = express()


const updateChoices = ()=>{
    const choice = new Choice({
        userType:["Student","Teacher","School"],
        medium:["Sinhala","Tamil","English"],
        district:["Vavuniya","Colombo","Mannar"],
        grade:["1","2","3","4","5","6","7","8","9","10","O/L","A/L","All"],
    })
    choice.save()
}

app.use(express.json())
app.use(cors())
app.use('/user',userRouter)
app.use('/post',postRouter)
app.use('/request',requestRouter)
app.use('/question',questionRouter)
app.use('/page',pageRouter)
app.use('/lab', labRouter)

app.get('/',(req,res)=>{
    res.send("Social Media for students backend")
})

app.get('/getChoices',async (req,res)=>{
    const choices = await Choice.find()
    res.send(choices[0])
})

mongoose.connect(dbURI,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then((res)=>{
    console.log("DB Connection successful")
    //updateChoices()
})
.catch((err)=>{
    console.log(err)
})
app.listen(PORT,(res,err)=>{
    if(!err) console.log("Server running")
    else console.log(err)
})


//eMgmTrJPj8AJRVqccUsu