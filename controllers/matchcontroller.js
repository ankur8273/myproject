const matchModel=require("../model/user.js");
class matchcontroller{
    static matchStart=async(req,res)=>{
        try{
        console.log(req.body);
        }catch(err){
            console.log(err);
        }
    }
}

module.exports=matchcontroller;