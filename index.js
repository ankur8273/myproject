var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
const {userModel}=require("./model/user.js");
const {matchModel}=require("./model/user.js");
const connectdb=require("./db/connectdb.js");
require("dotenv").config();
// for parsing application/json
app.use(express.json()); 
var qs = require("querystring");
var http = require("http");
const emailvalidator = require("email-validator");
const port=process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;
connectdb(DATABASE_URL);
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 
  
// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

app.post('/createuser',async(req, res)=>{
    try{
        app.use(upload.array());
        const {name,email,phone,password,confpassword}=req.body;
       if(!name || !phone )//|| !email  ||!password || !confpassword)
        {
            return res.json({code:201,'status':false,'sms':"All field Required."});
        }
        if(name.length<3){
            return res.json({code:201,'status':false,'sms':"Name must be of 3char"});
        }
        if(phone.length!=10){
            
            return res.json({code:201,'status':false,'sms':"Phone Invalid.."});
        }
        // if(password.length<6){
        //     return res.json({code:201,'status':false,'sms':"Password Must be of 6char"});
        // }
        // if(password!=confpassword){
        //     return res.json({code:201,'status':false,'sms':"password and confpassword must be same"});
        // }
        if(phone.length==10){
            const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/g;
            let result = phone.match(re);
            if(result){
                //validate phone number
                const resdoc=await userModel.findOne({phone:phone});
                if(resdoc){
                   return res.json({code:201,'status':false,'sms':"phone number is already exist try with another..."});
                }
                  //email validate start
                //   if(emailvalidator.validate(email))
                //   {
                    //create userid
                    var digits = '0123456789987098799';
                    var UserId = '';
                    for (let i = 0; i < 6; i++ ) {
                        UserId += digits[Math.floor(Math.random() * 10)];
                    }
                     
                   
                    function generateOTP() {
      
                        // Declare a digits variable 
                        // which stores all digits
                        var digits = '0123456789';
                        let OTP = '';
                        for (let i = 0; i < 4; i++ ) {
                            OTP += digits[Math.floor(Math.random() * 10)];
                        }
                        return OTP;
                    }
                      
                   
                     var OTP=generateOTP();

                    //refcode start
                    var MyRefCode=Math.random().toString(36).substr(2, 8);
                   
                    //CODE FOR MOBILE SEND OTP

                    var options = {
                        "method": "GET",
                        "hostname": "2factor.in",
                        "port": null,
                        "path": `/API/V1/4d064bb2-17af-11ed-9c12-0200cd936042/SMS/${phone}/${OTP}/ABCDEF`,
                        "headers": {
                          "content-type": "application/x-www-form-urlencoded"
                        }
                      };
                      
                      var req = http.request(options, function (res) {
                        var chunks = [];
                      
                        res.on("data", function (chunk) {
                          chunks.push(chunk);
                        });
                      
                        res.on("end", function () {
                          var body = Buffer.concat(chunks);
                          
                        });
                      });
                      
                      req.write(qs.stringify({}));
                      req.end();

                    //  END MOBILE SEND OTP
                    // END VALIDATE OTP  



                   const doc=await new userModel({
                       name,email,phone,password,UserId,otp:OTP,status:0,MyRefCode
                    });
                    
                    const result=new Object(req.body);
                    result.UserId=UserId;
                    const result1={data:doc};
                   
                    const result2={"status":true,"code":200,"sms":"Registration Pending Varify otp.",...result1}

                    await doc.save();
                 
                   return res.json(result2);
                   // FINAL END
                   }else{
                    res.status(400).send({code:201,'sms':"Email Invalid..","status":false});
                    }      

                //end validate phone number
            }
            else{
                        return res.json({"code":201,"sms":"phone Invalid","status":false});
             
        }
        
    }catch(err){
        return res.json(err.message);
    }


});
//varify registration with otp
app.post("/registerotp",async(req,res)=>{
    try{
        const {phone,otp}=req.body;
        if(!phone || !otp){
           return res.json({"code":201,"sttus":false,"sms":"All field Required"});
        }else{
           if(!phone || !otp){
               return res.json({"code":201,"sttus":false,"sms":"All field Required"});
             }
             if(phone.length!=10){
               return res.json({"code":201,"status":false,"sms":"Invalid Phone"});
             }
             if(otp.length!=4){
               return res.json({"code":201,"status":false,"sms":"Invalid OTP"});
             }else{
               const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/g;
               let result = phone.match(re);
               if(result){
                   const doc=await userModel.findOne({phone:phone});
                   if(doc==null){
                       return res.json({"code":201,"status":false,"sms":"Phone Not Registered."});
                   }else{
                       if(otp==doc.otp){
                           if(doc.status==1){
                               return res.json({"code":200,"status":true,"sms":"You Are Already Register You Can Login"});
                           }
                           const finaldoc= await userModel.findOneAndUpdate({phone:phone},{'$set':{'status':1}},{returnNewDocument:true});
                          
                          const data2={"data":finaldoc};
                          const data1={"code":200,"status":true,"sms":"Login Seccuss..",...data2}
                          return res.json(data1);
                       }
                       else{
                           return res.json({"code":201,"status":false,"sms":"Invalid otp"});
                       }
                   }
               }
             }
        }
         
         }catch(err){
           console.log(err);
         }
});

//generate otp at login time
app.post("/loginforotp",async(req,res)=>{
    const {phone}=req.body;
    try{
        if(req.body.phone==undefined){
        return res.json({"code":201,"status":false,"sms":"mobile number required"});
    
        }else{
                 //mobile number validation
    
    
         if(phone.length==10){
            const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/g;
            let result = phone.match(re);
                      if(result){
                           var resdoc=await userModel.findOne({phone:phone});
                           if(resdoc==null){
                            return res.json({code:201,'status':false,'sms':"Phone Not Registered."})
                           }else{
                           //otp start
                           function generateOTP() {
    
                            // Declare a digits variable 
                            // which stores all digits
                            var digits = '0123456789';
                            let OTP = '';
                            for (let i = 0; i < 4; i++ ) {
                                OTP += digits[Math.floor(Math.random() * 10)];
                            }
                            return OTP;
                        }
                          
                       
                         var OTP=generateOTP();

                                 //CODE FOR MOBILE SEND OTP

                    var options = {
                        "method": "GET",
                        "hostname": "2factor.in",
                        "port": null,
                        "path": `/API/V1/4d064bb2-17af-11ed-9c12-0200cd936042/SMS/${phone}/${OTP}/ABCDEF`,
                        "headers": {
                          "content-type": "application/x-www-form-urlencoded"
                        }
                      };
                      
                      var req = http.request(options, function (res) {
                        var chunks = [];
                      
                        res.on("data", function (chunk) {
                          chunks.push(chunk);
                        });
                      
                        res.on("end", function () {
                          var body = Buffer.concat(chunks);
                          
                        });
                      });
                      
                      req.write(qs.stringify({}));
                      req.end();

                    //  END MOBILE SEND OTP

                           //otp end
                            var resdoc=await userModel.findOneAndUpdate({phone:phone},{'$set':{'otp':OTP}});
                                //if user not send otp but number is authorized.
                                  var data={otp:OTP};
                                //when wrong otp at login time
                                 return res.json({"code":200,"status":true,"sms":"Varify otp",...data});
                            }
                        }
                    }else{
                        return res.json({"code":201,"status":"false","sms":"Invalid Mobile number."});
                    }
         //end mobile number validation.
        //    const doc=await userModel.findOne({phone:phone});
        //    console.log(doc);
        }
          
       
      }catch(err){
        console.log(err.message);
      }
})


//login with otp
  

app.post("/loginwithotp",async(req,res)=>{
    try{
        const {phone,otp}=req.body;
        console.log(req.body);
         
       if(!phone || !otp){
          return res.json({"code":201,"status":false,"sms":"All field required"});
       }else{

          //phone validate start
        if(phone.length==10){
          const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/g;
          let result = phone.match(re);
                    if(result){
                         var resdoc=await userModel.findOne({phone:phone});
                         if(resdoc==null){
                          return res.json({code:201,'status':false,'sms':"Phone Not Registered."})
                         }else{
                          if(otp==undefined || otp.length!=4){
                              //if user not send otp but number is authorized.
                              
                              //when wrong otp at login time
                               return res.json({"code":201,"status":false,"sms":"Invalid otp"});
                          }
                          else{
                              //if user send otp then varify
                              if(otp==resdoc.otp && resdoc.status==1){
                                  const newdata={data:resdoc};
                                    return res.json({"code":200,"status":true,"sms":"Login Success",...newdata});
                              }else{
                                  if(otp!=resdoc.otp){
                                      return res.json({"code":201,"status":false,"sms":"Invalid OTP"});
                                  }else{
                                      const data1={"data":{}};
                                      return res.json({"code":201,"status":false,"sms":"You have not proper Registered,otp varify panding..",...data1});
                                  }
                              }
                          }
                            console.log(resdoc);
                         }
                      }
               //generate otp
               function generateOTP() {
                
                  // Declare a digits variable 
                  // which stores all digits
                  var digits = '0123456789';
                  let OTP = '';
                  for (let i = 0; i < 4; i++ ) {
                      OTP += digits[Math.floor(Math.random() * 10)];
                  }
                  return OTP;
              }
               var OTP=generateOTP();
                  return res.json(resdoc);
      }else{
          return res.json({code:201,'status':false,'sms':"Phone Invalid."});
      }

       }
      }catch(err){
          console.log(err);
      }
});

//getamount

app.post("/getamount",async(req,res)=>{
    try{
        const {UserId}=req.body;
        if(!UserId){
           return res.json({"code":201,"status":false,"sms":"UserId Must be required"});
        }else{
           const result=await userModel.findOne({UserId:UserId});
          if(result==null){
           const data={};
           return res.json({"code":201,"status":false,"sms":"Invalid UserId",data});
          }else{
           const Amount=result.Amount;
           const response={data:{"Amount":Amount}};

           return res.json({"code":200,"status":true,"sms":"Success",...response});
          }
        }
   }catch(err){
       console.log(err.message);
   }
});

//get user details
app.post("/getuserdetails",async(req,res)=>{
    try{
        const {UserId}=req.body;
        if(!UserId){
            return res.json({"code":useridepty_error,"status":false,"sms":"UserId Must be required"});
        }else{
            const info=await userModel.findOne({UserId:UserId});
            if(info==null){
                return res.json({"code":201,"status":false,"sms":"Invalid UserId"});
            }else{
                const response={data:info};
                return res.json({"code":200,"status":true,"sms":"Success",...response});
            }
        }
       
        
    }catch(err){
        console.log(err.message);
    }
});

//matchStart

app.post("/matchstart",async(req,res)=>{
    try{
              
        console.log(req.body.playerCount);
        if(!req.body.playerCount){
          return res.send({"code":201,"status":false,"sms":"Player count required."});
        }else{
          var digits = '0123456789987098799';
          var RoomId = '';
          for (let i = 0; i < 8; i++ ) {
              RoomId += digits[Math.floor(Math.random() * 10)];
          }
        if(req.body.playerCount==2){
          const doc=await matchModel({
              playerCount:req.body.playerCount,
              roomId:RoomId
          });
          await doc.save();
          return res.send({"code":200,"status":true,"sms":"match started with 2 player",'Room_Id':RoomId});
        }
         if(req.body.playerCount==4){
          const doc=await matchModel({
              playerCount:req.body.playerCount,
              roomId:RoomId
          });
          await doc.save();
          return res.send({"code":200,"status":true,"sms":"match started with 4 player",'Room_Id':RoomId});
        }
            return res.send({"code":201,"status":false, "sms":"Invalid player count..",'RoomId':''});
        }
            
            
        }catch(err){
          console.log(err);
        }
})


app.listen(port,()=>{
    console.log(`server is runnign on ${port}`);
})