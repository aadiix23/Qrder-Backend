const mongoose = require("mongoose");

const tableSchema= new Mongoose.schema({
    tableNumber:{
        type:String,
        requred:true,
        trim:true
    },
    tableStatus:{
        type:Boolean,
        default:false,
        required:true
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},{_id:false})

const billingToolSchema= new Mongoose.schema({
    taxpercent:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    otherCharges:{
        type:Number,
        default:0
    },
    otherChargesLabel:{
        type:String,
        default:"Other Charges",
        maxLength:90,
        trim:true
    }
},{_id:false})

const restaurantSchema = new Mongoose.schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:mongoose.Schema.types.objectId,
        ref:"User",
        required:"true"
    },
    address:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    },
    logo:{
        type:String
    },
    payementQrCode:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    tableStatus:{
        type:[tableSchema],
        default:[]
    },
    billingSetting:{
        type:billingToolSchema
    }
},{timestamps:true})
module.exports = mongoose.model("Restaurant", restaurantSchema);