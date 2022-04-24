const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subjectSchema = new Schema({
    grade:String,
    medium:String,
    subject:String
})

const Subject = mongoose.model('Subject',subjectSchema)

module.exports = Subject