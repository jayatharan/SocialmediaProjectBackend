const mongoose = require('mongoose')
const Schema = mongoose.Schema

const labItemSchema = new Schema({
    labId:{
        type: Schema.Types.ObjectId, 
        ref: 'Lab'
    },
    name:{
        type:String
    },
    img_name:{
        type:String
    },
    quantity:{
        type:Number,
        default:0
    },
    unit:{
        type:String,
        default:""
    },
    published:{
        type:Boolean,
        default:false
    },
    schoolName:{
        type:String,
        default:""
    }
})

const LabItem = mongoose.model('LabItem', labItemSchema)

module.exports = LabItem