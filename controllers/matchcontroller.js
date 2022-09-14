const {matchModel}=require("../model/user.js");
const {historyModel}=require("../model/user.js");
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
const errorStatus=require('../errorStatus');
app.use(upload.array()); 
class matchcontroller{
    static matchStart=async(req,res)=>{
        try{
              const {
                room_id,       
                player_count,
                user_id,
                game_mode,
                bet_amount,
                bet_id
                
            }=req.body;
                if(!room_id || !player_count || !user_id || !game_mode || !bet_amount|| !bet_id){
                    return res.json({"code":errorStatus.allfieldrequired,"sms":'All  filled required','status':false});
                }else{
                    const timestamp = Date.now();
                   var Unique= Math.random().toString(26).slice(2)
                    const doc=new matchModel({
                        roomId:room_id,       
                        playerCount:player_count,
                        game_mode,
                        bet_amount,
                        bet_id:bet_id,
                        rank_available:player_count,
                        left_available:player_count,
                        status:1,
                        Unique_id:Unique,
                        timestamp
       

                    });

                    await doc.save();


                    const userId=user_id.split(',');
                    console.log(userId);
                    for (let i = 0; i < userId.length; i++) {
                        
                              const history=new historyModel({
                                roomId:room_id,
                                user_id:userId[i],
                                bet_status:1,
                                rank:0,
                                rank_amount:0,
                                type :'',
                                Unique_id:Unique,
                                timestamp
                              })
                              await history.save();
                               
                             
                        }
                        return res.json({"code":errorStatus.errorsuccess,"sms":'Game start successfully','status':true});
                       
                } 
            
            
            }catch(err){
                return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
            }
    };


    //get last user
    static getlastroomId=async(req,res)=>{
        try{
              const {
                user_id        
            }=req.body;
                if(!user_id){
                    return res.json({"code":errorStatus.allfieldrequired,"sms":'All  filled required','status':false});
                }else{
                       const lastuser=await historyModel.findOne({user_id:user_id});
                       return res.json({"code":errorStatus.errorsuccess,status:true,"sms":'Success',data:lastuser});
                        
                  
                    }

            }catch(err){
                return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
            }
    }

    static matchStartStatusUpdate=async(req,res)=>{
        try{
              const {
                room_id,       
                user_id,
                type,
                
            }=req.body;
                if(!room_id  || !user_id ){
                    return res.json({"code":errorStatus.allfieldrequired,"sms":'All  filled required','status':false});
                }else{
                    const timestamp = Date.now();
                    const room_details=await matchModel.findOne({user_id:user_id,roomId:room_id});
                   
                    if(type=='1'){
                       var rank_available_current=room_details.rank_available-1;
                       var rank=(room_details.playerCount-room_details.rank_available)+1;
                       var rank_amount=50;
                       var type_status=type;
                      
                    }else{
                       var rank_available_current=room_details.rank_available;
                       var rank=0;
                       var rank_amount=0;
                       var type_status='left';
                    } 
                     
                    const update_match_start={rank_available:rank_available_current};
                    const update_match_histroy={rank:rank,rank_amount:rank_amount,type:type_status};

                    
                   
                   await matchModel.findOneAndUpdate({user_id:user_id,roomId:room_id},update_match_start,{new:true});

                    await historyModel.findOneAndUpdate({user_id:user_id,roomId:room_id},update_match_histroy,{new:true});
                
                    return res.json({"code":errorStatus.errorsuccess,"sms":'Winner declered successfully','status':true});
                       
                } 
            
            
            }catch(err){
                return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
            }
    };



}

module.exports=matchcontroller;