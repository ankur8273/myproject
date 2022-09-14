const express=require("express");
const router=express.Router();
const matchcontroller=require("../controllers/matchcontroller.js");

router.post("/roomcreate",matchcontroller.matchStart);
router.post("/getlastroomId",matchcontroller.getlastroomId);
router.post("/matchStartStatusUpdate",matchcontroller.matchStartStatusUpdate);

module.exports=router;
