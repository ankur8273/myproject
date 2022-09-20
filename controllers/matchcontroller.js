const {matchModel}=require("../model/user.js");
const {historyModel}=require("../model/user.js");
const {gameModeModel}=require("../model/user.js");
const {betdeductionModel}=require("../model/user.js");
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
console.log(__dirname+"/public/userprofile");
const errorStatus=require('../errorStatus');
app.use(upload.array()); 
class matchcontroller{

    static getprofile=async(req,res)=>{
        const publicUrl=__dirname+"/uploads";
        try{
            return res.json({"code":errorStatus.errorsuccess,"publicAccess":publicUrl});
          
        }catch(err){
            return res.json({"code":errorStatus.internal_serverError,"sms":"something went wrong."});
        }
    }
    static matchStart=async(req,res)=>{
        try{
              const {
                room_id,       
                player_count,
                UserId,
                game_mode,
                bet_amount,
                bet_id
                
            }=req.body;
                if(!room_id || !player_count || !UserId || !game_mode || !bet_amount|| !bet_id){
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
                     const userId1=UserId.split(',');
                    if(player_count== (userId1.length-1)){
                    for (let i = 0; i < userId1.length; i++) {
                        
                              const history=new historyModel({
                                roomId:room_id,
                                UserId:userId1[i],
                                bet_status:1,
                                rank:0,
                                win_amount:0,
                                type :'',
                                Unique_id:Unique,
                                timestamp
                              })
                             if(userId1[i]){
                              await history.save();
                             }
                              
                               
                             
                        }

                        return res.json({"code":errorStatus.errorsuccess,"sms":'Game start successfully','status':true});  
                    }else{
                        return res.json({"code":errorStatus.GamePlayernotComplete,"sms":'Game Player not complete','status':true});

                    }


                      
                       
                } 
            
            
            }catch(err){
                return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
            }
    };


    //get last user
    static getlastroomId=async(req,res)=>{
        try{
              const {
                UserId        
            }=req.body;
                if(!UserId){
                    return res.json({"code":errorStatus.allfieldrequired,"sms":'All  filled required','status':false});
                }else{
                       const lastuser=await historyModel.findOne({UserId:UserId});
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
                UserId,
                type,
                
            }=req.body;
                if(!room_id  || !UserId ){
                    return res.json({"code":errorStatus.allfieldrequired,"sms":'All  filled required','status':false});
                }else{
                    const timestamp = Date.now();
                    const room_details=await matchModel.findOne({UserId:UserId,roomId:room_id});
                   
                    if(type=='1'){
                       var rank_available_current=room_details.rank_available-1;
                       var rank=(room_details.playerCount-room_details.rank_available)+1;
                       var win_amount=50;
                       var type_status=type;
                      
                    }else{
                       var rank_available_current=room_details.rank_available;
                       var rank=0;
                       var win_amount=0;
                       var type_status='left';
                    } 
                     
                    const update_match_start={rank_available:rank_available_current};
                    const update_match_histroy={rank:rank,win_amount:win_amount,type:type_status,'bet_status':2};

                    
                   
                   await matchModel.findOneAndUpdate({UserId:UserId,roomId:room_id},update_match_start,{new:true});

                    await historyModel.findOneAndUpdate({UserId:UserId,roomId:room_id},update_match_histroy,{new:true});
                    const userlists= await historyModel.find({roomId:room_id})
                    
                    const objects = {};
                      for(let i=0;i<Object.keys(userlists).length;i++){

                       
                        objects[(userlists)[i].UserId]={
                             "UserId":(userlists)[i].UserId,
                             "timestamp":(userlists)[i].timestamp,
                             "rank":(userlists)[i].rank,
                             "win_amount":(userlists)[i].win_amount,
                             "type":(userlists)[i].type,
                             "room_id":(userlists)[i].roomId,
                         }
                         
                      }
                      const game_count= await historyModel.find({roomId:room_id,bet_status:2});
                     
                      if(game_count.length==room_details.playerCount){
                        var game_status_count=1;
                      }else{
                        var game_status_count=0;
                      }
                      const room = {
                        room_id: room_details.roomId,
                        playerCount: room_details.playerCount,
                        game_mode:room_details.game_mode ,
                        bet_amount:room_details.bet_amount ,
                        timestamp: room_details.timestamp,
                        game_status: game_status_count
                      }
                      
                      const objectsData = {
                        userlists: objects
                      }
                      
                      const user = { ...room, ...objectsData } 
                    // console.log(data_details);
                    // }
                    return res.json({"code":errorStatus.errorsuccess,"sms":'Winner declered successfully','status':true,data:user});
                       
                } 
            
            
            }catch(err){
                return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
            }
    };

    //reader board

    static LeaderBoard=async(req,res)=>{
        try{
            //const {UserId}=req.body;
            //    var allplayer= await matchModel.find();
                var history= await historyModel.find();
                history.forEach((userid)=>{
                    console.log(userid.UserId);
                })
               var historys=  await historyModel.aggregate([
                {
                   "$group": {
                      "_id":null,
                      "AvgValue": {
                        "$avg": "$rank"
                         }
                      }
                    }
                 ]);
               console.log(historys);
               
               const unique=await historyModel.find().distinct("UserId",function(error,ids){
                    console.log(ids);
               })
               return res.json({"code":errorStatus.Bad_Request,"sms":"success",'status':false,"data":historys});
            //    console.log(history);
               const allUser={
                AllUser:{
                   one: {
                        Rank : 1,
                        Name:"amit",
                        AvatarId:1,
                        totalWinAmount:10000,
                        UserId:"abc"
                      },
                },
               }
        }catch(err){
            return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
        }
    };

    static Bet_List_create=async(req,res)=>{
        try{
            const timestamp = Date.now();
            const {title,status,player_type,code}=req.body;
            const doc=await gameModeModel({
                title,status,player_type,code,timestamp:timestamp
            });
            await doc.save();
            return res.json({"code":200,"sms":"success","status":true,data:doc});
        }catch(err){
            return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
        }
    }
    static Bet_deduction_create=async(req,res)=>{
        try{
            const timestamp = Date.now();
            const {bet_code,status,amount,code,rank,rank_winning_amount}=req.body;
            const rank1=rank.split(',');
            const rank_win_amount=rank_winning_amount.split(',');
            var arr = [];
            var obj = {};
            for (let i = 0; i < rank1.length; i++) {     
                obj[[rank1[i]]]= rank_win_amount[i] 
                }

                
             
                const doc=await betdeductionModel({
                    bet_code,status,amount,rank_winning_amount:obj,timestamp:timestamp
                });
                await doc.save();
            
          
            return res.json({"code":200,"sms":"success","status":true });
        }catch(err){
            return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
        }
    }
     static bet_list_all=async(req,res)=>{
           try{
            const doc=await gameModeModel.find({'status':"1"},{"_id":0,"title":1,"status":1,"player_type":1,"code":1,"timestamp":1});
            var objects={}
             for(let i=0;i<doc.length;i++){
            
                


                var docbetduction=await betdeductionModel.find({'status':"1",'bet_code':doc[i].code});
                var deductionobj={}
                for(let x=0;x<docbetduction.length;x++){
                    deductionobj[docbetduction[x].unique_id]={
                            "status":docbetduction[x].status,
                            "amount":docbetduction[x].amount,
                            "rank_winning_amount":{...docbetduction[x].rank_winning_amount}
                    }
                }

                console.log(docbetduction);

                objects[(doc)[i].title]={... deductionobj}
               
              
             }


             console.log(objects);

             
            return res.json({"code":errorStatus.errorsuccess,"sms":'succes',"data":objects,'status':false});
     }catch(err){
        return res.json({"code":errorStatus.Bad_Request,"sms":err.message,'status':false});
     }
}
}

module.exports=matchcontroller;