const mongoose=require("mongoose");

const userSchema=({
    name:{type:String,required:true},
    email:{type:String},
    phone: {type:Number,required:true,Unique:true},
    password:{type:String},
    UserId:{type:String,required:true},
    Amount:{ type: Number,default:0},
    Label:{type:Number,default:0},
    TotalPlayedGame:{type:Number,default:0},
    TotalLose:{type:Number,default:0},
    TotalEarning:{type:Number,default:0.00},
    CurrentBalanace:{ type:Number,default:0.00},
    DirrectReferal:{ type: Number},
    TotalReferalTeam:{type:Number,default:0},
    TotalReferalIncome:{ type: Number,default:0.00},
    MyRefCode:{type:String,required:true},
    otp:{type:Number,required:true},
    avatarId:{type:String,default:0},
    status:{type:Number,required:true}

});

const matchSchema=({
    roomId:{type:String,required:true},
    playerCount:{type:Number,required:true}
});

const userModel= new mongoose.model("User",userSchema);
const matchModel= new mongoose.model("match",matchSchema);

module.exports={userModel,matchModel};