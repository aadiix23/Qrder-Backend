const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    isverified:{
        type:Boolean,
        default:false
    },
    roles: {
        type: String,
        enum: ["admin", "chef", "superadmin"],
        default: "admin"
    },
    disabled: {
       type:Boolean,
       default:false
    },
    otp:{
        type:String
    },
    otpExpiry:{
        type:Date
    },
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Restaurant'
    }
    
},{timestamps:true})

module.exports=mongoose.model("User",userSchema);