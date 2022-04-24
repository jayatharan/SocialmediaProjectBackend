const mongoose = require('mongoose')
const Schema = mongoose.Schema

const labSchema = new Schema({
    name:{
        type:String
    },
    schoolId:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    schoolName:{
        type:String
    },
    published:{
        type:Boolean,
        default:false
    }
})

const Lab = mongoose.model('Lab', labSchema)
module.exports = Lab