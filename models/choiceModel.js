const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subjectsSchema = new Schema({
    grade:String,
    medium:String,
    subjects:[String]
})

const choiceSchema = new Schema({
    userType:[String],
    medium:[String],
    district:[String],
    grade:[String],
    subjects:[subjectsSchema]
})

const Choice = mongoose.model('Choice',choiceSchema)

module.exports = Choice