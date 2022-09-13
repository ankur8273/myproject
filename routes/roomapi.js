const express=require("express");
const router=express.Router();
const matchcontroller=require("../controllers/matchcontroller.js");

router.post("/roomcreate",matchcontroller.matchStart);

module.exports=router;

